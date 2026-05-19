import { Injectable, Logger } from '@nestjs/common';
import { IProductRepository, ProductListItem } from 'src/domain/repositories/product.repository';

/**
 * Janela de retenção da lixeira de produtos.
 * Após 30 dias com `deletedAt` setado, o produto é apagado permanentemente.
 */
export const TRASH_RETENTION_DAYS = 30;

@Injectable()
export class ListDeletedProductsUseCase {
  constructor(private readonly repo: IProductRepository) {}
  async execute(): Promise<ProductListItem[]> {
    return this.repo.listDeleted();
  }
}

@Injectable()
export class RestoreProductUseCase {
  constructor(private readonly repo: IProductRepository) {}
  async execute(id: string): Promise<void> {
    // get() filtra deletedAt:null, então usamos hardDeleteExpired-style: confiamos no id
    // Se já restaurado, é no-op.
    await this.repo.restore(id);
  }
}

@Injectable()
export class HardDeleteProductUseCase {
  constructor(private readonly repo: IProductRepository) {}
  async execute(id: string): Promise<void> {
    await this.repo.hardDelete(id);
  }
}

@Injectable()
export class CleanupExpiredDeletedProductsUseCase {
  private readonly logger = new Logger(CleanupExpiredDeletedProductsUseCase.name);

  constructor(private readonly repo: IProductRepository) {}

  async execute(): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - TRASH_RETENTION_DAYS);
    const count = await this.repo.hardDeleteExpired(cutoff);
    if (count > 0) {
      this.logger.log(
        `[TrashCleanup] Hard-deleted ${count} produto(s) com deletedAt anterior a ${cutoff.toISOString()}`,
      );
    }
    return count;
  }
}
