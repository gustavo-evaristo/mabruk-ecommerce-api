import { AttributeEntity } from 'src/domain/entities/attribute.entity';
import { AttributeValueEntity } from 'src/domain/entities/attribute-value.entity';

export const presentAttribute = (a: AttributeEntity, values: AttributeValueEntity[] = []) => ({
  id: a.id.toString(),
  slug: a.slug,
  name: a.name,
  type: a.type,
  order: a.order,
  values: values.map(presentAttributeValue),
});

export const presentAttributeValue = (v: AttributeValueEntity) => ({
  id: v.id.toString(),
  attributeId: v.attributeId.toString(),
  slug: v.slug,
  name: v.name,
  hex: v.hex,
  order: v.order,
});
