import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AttributeValueDraft,
  AttributeWithValues,
  IAttributeRepository,
} from 'src/domain/repositories/attribute.repository';
import { AttributeEntity, AttributeType } from 'src/domain/entities/attribute.entity';
import { AttributeValueEntity } from 'src/domain/entities/attribute-value.entity';
import { Slug } from 'src/domain/entities/vos';

@Injectable()
export class ListAttributesUseCase {
  constructor(private readonly repo: IAttributeRepository) {}
  execute(): Promise<AttributeWithValues[]> {
    return this.repo.list();
  }
}

@Injectable()
export class CreateAttributeUseCase {
  constructor(private readonly repo: IAttributeRepository) {}

  async execute(input: {
    name: string;
    slug?: string;
    type?: AttributeType;
    valueDrafts?: { name: string; slug?: string; hex?: string | null }[];
  }): Promise<AttributeEntity> {
    const slug = input.slug ? Slug.from(input.slug).value : Slug.fromText(input.name).value;
    const exists = await this.repo.findBySlug(slug);
    if (exists) throw new ConflictException(`Atributo com slug "${slug}" já existe`);
    const attr = new AttributeEntity({
      slug,
      name: input.name,
      type: input.type ?? 'SELECT',
    });
    const drafts: AttributeValueDraft[] = (input.valueDrafts ?? []).map((d, i) => ({
      slug: d.slug ? Slug.from(d.slug).value : Slug.fromText(d.name).value,
      name: d.name,
      hex: d.hex ?? null,
      order: i,
    }));
    // valida slugs únicos dentro do mesmo atributo
    const slugs = new Set<string>();
    for (const d of drafts) {
      if (slugs.has(d.slug)) {
        throw new BadRequestException(`Valor duplicado: "${d.slug}"`);
      }
      slugs.add(d.slug);
    }
    await this.repo.create(attr, drafts);
    return attr;
  }
}

@Injectable()
export class UpdateAttributeUseCase {
  constructor(private readonly repo: IAttributeRepository) {}

  async execute(input: {
    id: string;
    name?: string;
    slug?: string;
    type?: AttributeType;
    order?: number;
  }): Promise<AttributeEntity> {
    const attr = await this.repo.get(input.id);
    if (!attr) throw new NotFoundException('Atributo não encontrado');
    if (input.slug && input.slug !== attr.slug) {
      const conflict = await this.repo.findBySlug(input.slug);
      if (conflict) throw new ConflictException(`Slug "${input.slug}" já está em uso`);
    }
    attr.update(input);
    await this.repo.update(attr);
    return attr;
  }
}

@Injectable()
export class DeleteAttributeUseCase {
  constructor(private readonly repo: IAttributeRepository) {}

  async execute(id: string): Promise<void> {
    const inUse = await this.repo.isInUse(id);
    if (inUse) {
      throw new ConflictException(
        'Atributo está vinculado a produtos. Remova dos produtos antes de excluir.',
      );
    }
    await this.repo.delete(id);
  }
}

@Injectable()
export class CreateAttributeValueUseCase {
  constructor(private readonly repo: IAttributeRepository) {}

  async execute(input: {
    attributeId: string;
    name: string;
    slug?: string;
    hex?: string | null;
    order?: number;
  }): Promise<AttributeValueEntity> {
    const attr = await this.repo.get(input.attributeId);
    if (!attr) throw new NotFoundException('Atributo não encontrado');
    const slug = input.slug ? Slug.from(input.slug).value : Slug.fromText(input.name).value;
    // checa colisão dentro do mesmo atributo
    const existing = await this.repo.listValues(input.attributeId);
    if (existing.some((v) => v.slug === slug)) {
      throw new ConflictException(`Valor "${slug}" já existe nesse atributo`);
    }
    const value = new AttributeValueEntity({
      attributeId: input.attributeId,
      slug,
      name: input.name,
      hex: input.hex,
      order: input.order ?? existing.length,
    });
    await this.repo.createValue(value);
    return value;
  }
}

@Injectable()
export class UpdateAttributeValueUseCase {
  constructor(private readonly repo: IAttributeRepository) {}

  async execute(input: {
    valueId: string;
    name?: string;
    slug?: string;
    hex?: string | null;
    order?: number;
  }): Promise<AttributeValueEntity> {
    const value = await this.repo.getValue(input.valueId);
    if (!value) throw new NotFoundException('Valor não encontrado');
    value.update({
      name: input.name,
      slug: input.slug ? Slug.from(input.slug).value : undefined,
      hex: input.hex ?? undefined,
      order: input.order,
    });
    await this.repo.updateValue(value);
    return value;
  }
}

@Injectable()
export class DeleteAttributeValueUseCase {
  constructor(private readonly repo: IAttributeRepository) {}

  async execute(valueId: string): Promise<void> {
    const inUse = await this.repo.isValueInUse(valueId);
    if (inUse) {
      throw new ConflictException('Valor está em uso por alguma variante de produto.');
    }
    await this.repo.deleteValue(valueId);
  }
}
