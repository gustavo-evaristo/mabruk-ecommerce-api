import { AttributeEntity } from '../entities/attribute.entity';
import { AttributeValueEntity } from '../entities/attribute-value.entity';

export interface AttributeWithValues {
  attribute: AttributeEntity;
  values: AttributeValueEntity[];
}

export abstract class IAttributeRepository {
  abstract list(): Promise<AttributeWithValues[]>;
  abstract get(id: string): Promise<AttributeEntity | null>;
  abstract findBySlug(slug: string): Promise<AttributeEntity | null>;
  abstract create(attr: AttributeEntity, valueDrafts: AttributeValueDraft[]): Promise<void>;
  abstract update(attr: AttributeEntity): Promise<void>;
  abstract delete(id: string): Promise<void>;
  abstract isInUse(id: string): Promise<boolean>;

  abstract listValues(attributeId: string): Promise<AttributeValueEntity[]>;
  abstract getValue(valueId: string): Promise<AttributeValueEntity | null>;
  abstract createValue(value: AttributeValueEntity): Promise<void>;
  abstract updateValue(value: AttributeValueEntity): Promise<void>;
  abstract deleteValue(valueId: string): Promise<void>;
  abstract isValueInUse(valueId: string): Promise<boolean>;
}

export interface AttributeValueDraft {
  slug: string;
  name: string;
  hex?: string | null;
  order?: number;
}
