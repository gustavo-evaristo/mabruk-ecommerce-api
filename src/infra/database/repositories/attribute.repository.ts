import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  AttributeValueDraft,
  AttributeWithValues,
  IAttributeRepository,
} from 'src/domain/repositories/attribute.repository';
import { AttributeEntity, AttributeType } from 'src/domain/entities/attribute.entity';
import { AttributeValueEntity } from 'src/domain/entities/attribute-value.entity';
import { UUID } from 'src/domain/entities/vos';

@Injectable()
export class AttributeRepository implements IAttributeRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(row: any): AttributeEntity {
    return new AttributeEntity({
      id: UUID.from(row.id),
      slug: row.slug,
      name: row.name,
      type: row.type as AttributeType,
      order: row.order,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  private toValueEntity(row: any): AttributeValueEntity {
    return new AttributeValueEntity({
      id: UUID.from(row.id),
      attributeId: UUID.from(row.attributeId),
      slug: row.slug,
      name: row.name,
      hex: row.hex,
      order: row.order,
      createdAt: row.createdAt,
    });
  }

  async list(): Promise<AttributeWithValues[]> {
    const rows = await this.prisma.attributes.findMany({
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
      include: { values: { orderBy: [{ order: 'asc' }, { name: 'asc' }] } },
    });
    return rows.map((a) => ({
      attribute: this.toEntity(a),
      values: a.values.map((v) => this.toValueEntity(v)),
    }));
  }

  async get(id: string): Promise<AttributeEntity | null> {
    const row = await this.prisma.attributes.findUnique({ where: { id } });
    return row ? this.toEntity(row) : null;
  }

  async findBySlug(slug: string): Promise<AttributeEntity | null> {
    const row = await this.prisma.attributes.findUnique({ where: { slug } });
    return row ? this.toEntity(row) : null;
  }

  async create(attr: AttributeEntity, valueDrafts: AttributeValueDraft[]): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.attributes.create({
        data: {
          id: attr.id.toString(),
          slug: attr.slug,
          name: attr.name,
          type: attr.type,
          order: attr.order,
          createdAt: attr.createdAt,
          updatedAt: attr.updatedAt,
        },
      });
      if (valueDrafts.length > 0) {
        await tx.attribute_values.createMany({
          data: valueDrafts.map((v) => ({
            attributeId: attr.id.toString(),
            slug: v.slug,
            name: v.name,
            hex: v.hex ?? null,
            order: v.order ?? 0,
          })),
        });
      }
    });
  }

  async update(attr: AttributeEntity): Promise<void> {
    await this.prisma.attributes.update({
      where: { id: attr.id.toString() },
      data: {
        slug: attr.slug,
        name: attr.name,
        type: attr.type,
        order: attr.order,
        updatedAt: attr.updatedAt,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.attributes.delete({ where: { id } });
  }

  async isInUse(id: string): Promise<boolean> {
    const used = await this.prisma.product_attributes.count({
      where: { attributeId: id },
    });
    return used > 0;
  }

  async listValues(attributeId: string): Promise<AttributeValueEntity[]> {
    const rows = await this.prisma.attribute_values.findMany({
      where: { attributeId },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    });
    return rows.map((r) => this.toValueEntity(r));
  }

  async getValue(valueId: string): Promise<AttributeValueEntity | null> {
    const row = await this.prisma.attribute_values.findUnique({ where: { id: valueId } });
    return row ? this.toValueEntity(row) : null;
  }

  async createValue(v: AttributeValueEntity): Promise<void> {
    await this.prisma.attribute_values.create({
      data: {
        id: v.id.toString(),
        attributeId: v.attributeId.toString(),
        slug: v.slug,
        name: v.name,
        hex: v.hex,
        order: v.order,
        createdAt: v.createdAt,
      },
    });
  }

  async updateValue(v: AttributeValueEntity): Promise<void> {
    await this.prisma.attribute_values.update({
      where: { id: v.id.toString() },
      data: {
        slug: v.slug,
        name: v.name,
        hex: v.hex,
        order: v.order,
      },
    });
  }

  async deleteValue(valueId: string): Promise<void> {
    await this.prisma.attribute_values.delete({ where: { id: valueId } });
  }

  async isValueInUse(valueId: string): Promise<boolean> {
    const used = await this.prisma.product_variant_values.count({
      where: { attributeValueId: valueId },
    });
    return used > 0;
  }
}
