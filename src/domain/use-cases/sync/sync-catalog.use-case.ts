import { Injectable, Logger } from '@nestjs/common';
import { JueriHttpService } from '../../../infra/jueri/jueri-http.service';
import { ICategoryRepository } from '../../repositories/category.repository';
import { ISubcategoryRepository } from '../../repositories/subcategory.repository';
import { IProductRepository } from '../../repositories/product.repository';
import { IInventoryRepository } from '../../repositories/inventory.repository';
import { ISyncLogRepository } from '../../repositories/sync-log.repository';
import { CategoryEntity } from '../../entities/category.entity';
import { SubcategoryEntity } from '../../entities/subcategory.entity';
import { ProductEntity } from '../../entities/product.entity';
import { InventoryEntity } from '../../entities/inventory.entity';
import { JueriProduct } from '../../../infra/jueri/jueri.types';

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function resolvePlatingType(product: JueriProduct): string | null {
  if (product.custo_banho_ouro > 0) return 'ouro';
  if (product.custo_banho_rodio > 0) return 'rodio';
  if (product.custo_banho_prata > 0) return 'prata';
  return null;
}

function resolvePrice(product: JueriProduct): number {
  const priceType = product.tipo_preco?.[0];
  return priceType?.pivot?.preco ?? product.custo_compra_bruto ?? 0;
}

export interface SyncCatalogResult {
  categories: number;
  subcategories: number;
  products: { upserted: number; deactivated: number };
}

@Injectable()
export class SyncCatalogUseCase {
  private readonly logger = new Logger(SyncCatalogUseCase.name);

  constructor(
    private readonly jueriService: JueriHttpService,
    private readonly categoryRepository: ICategoryRepository,
    private readonly subcategoryRepository: ISubcategoryRepository,
    private readonly productRepository: IProductRepository,
    private readonly inventoryRepository: IInventoryRepository,
    private readonly syncLogRepository: ISyncLogRepository,
  ) {}

  async execute(): Promise<SyncCatalogResult> {
    const startedAt = Date.now();
    this.logger.log('Starting full catalog sync from Jueri...');

    try {
      // 1. Sync categories
      const categoriesCount = await this.syncCategories();

      // 2. Sync subcategories
      const subcategoriesCount = await this.syncSubcategories();

      // 3. Sync products
      const productsResult = await this.syncProducts();

      const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
      this.logger.log(
        `Sync complete in ${elapsed}s — categories: ${categoriesCount}, subcategories: ${subcategoriesCount}, products: ${productsResult.upserted} upserted / ${productsResult.deactivated} deactivated`,
      );

      await this.syncLogRepository.create({
        type: 'PRODUCT_PULL',
        direction: 'pull',
        status: 'success',
        itemsAffected: productsResult.upserted,
      });

      return { categories: categoriesCount, subcategories: subcategoriesCount, products: productsResult };
    } catch (error) {
      this.logger.error('Catalog sync failed', error);

      await this.syncLogRepository.create({
        type: 'PRODUCT_PULL',
        direction: 'pull',
        status: 'error',
        errorMessage: error?.message,
      });

      throw error;
    }
  }

  private async syncCategories(): Promise<number> {
    const jueriCategories = await this.jueriService.listCategories();
    let count = 0;

    for (const cat of jueriCategories) {
      if (!cat.nome) continue;
      const entity = new CategoryEntity({
        jueriId: cat.id,
        name: cat.nome,
        slug: toSlug(cat.nome),
      });
      await this.categoryRepository.upsert(entity);
      count++;
    }

    this.logger.log(`  → categories synced: ${count}`);
    return count;
  }

  private async syncSubcategories(): Promise<number> {
    const jueriSubs = await this.jueriService.listSubcategories();
    const categories = await this.categoryRepository.list();
    const catByJueriId = new Map(categories.map((c) => [c.jueriId, c]));
    let count = 0;

    for (const sub of jueriSubs) {
      if (!sub.nome) continue;
      const category = catByJueriId.get(sub.fk_categoria_id);
      if (!category) continue;

      const entity = new SubcategoryEntity({
        jueriId: sub.id,
        categoryId: category.id.toString(),
        name: sub.nome,
        slug: toSlug(sub.nome),
      });
      await this.subcategoryRepository.upsert(entity);
      count++;
    }

    this.logger.log(`  → subcategories synced: ${count}`);
    return count;
  }

  private async syncProducts(): Promise<{ upserted: number; deactivated: number }> {
    const [jueriProducts, categories, subcategories] = await Promise.all([
      this.jueriService.listAllProducts(),
      this.categoryRepository.list(),
      this.subcategoryRepository.list(),
    ]);

    const catByJueriId = new Map(categories.map((c) => [c.jueriId, c]));
    const subByJueriId = new Map(subcategories.map((s) => [s.jueriId, s]));

    let upserted = 0;
    const activeJueriIds: number[] = [];

    for (const jp of jueriProducts) {
      activeJueriIds.push(jp.id);

      const existing = await this.productRepository.findByJueriId(jp.id);
      const category = jp.fk_categoria_id ? catByJueriId.get(jp.fk_categoria_id) : null;
      const subcategory = jp.fk_subcategoria_id ? subByJueriId.get(jp.fk_subcategoria_id) : null;

      const entity = new ProductEntity({
        id: existing?.id ?? null,
        jueriId: jp.id,
        sku: jp.referencia ?? jp.numero_peca ?? null,
        name: jp.descricao,
        description: jp.observacao ?? null,
        descriptionFull: jp.descricao_completa ?? null,
        categoryId: category?.id?.toString() ?? null,
        subcategoryId: subcategory?.id?.toString() ?? null,
        platingType: resolvePlatingType(jp),
        price: resolvePrice(jp),
        weight: jp.peso ?? null,
        color: jp.cor ?? null,
        barcode: jp.codigo_barras ?? null,
        isActive: jp.fk_status_id === 1,
        isFeatured: existing?.isFeatured ?? false,
        isRecommended: existing?.isRecommended ?? false,
        isFavorite: existing?.isFavorite ?? false,
        displayOrder: existing?.displayOrder ?? 0,
        lastSyncedAt: new Date(),
        createdAt: existing?.createdAt ?? null,
      });

      await this.productRepository.upsert(entity);

      // Upsert inventory
      const inventoryEntity = new InventoryEntity({
        productId: entity.id.toString(),
        quantity: jp.quantidade ?? 0,
        reservedQuantity: 0,
        lastSyncedAt: new Date(),
      });
      await this.inventoryRepository.upsert(inventoryEntity);

      upserted++;
    }

    // Deactivate products no longer active in Jueri
    const deactivated = await this.productRepository.deactivateByJueriIds(activeJueriIds);
    this.logger.log(`  → products upserted: ${upserted}, deactivated: ${deactivated}`);

    return { upserted, deactivated };
  }
}
