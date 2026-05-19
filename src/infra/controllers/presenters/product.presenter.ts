import {
  ProductDetails,
  ProductListItem,
} from 'src/domain/repositories/product.repository';
import { VariantAttributeValue } from 'src/domain/repositories/product-variant.repository';

/**
 * Helpers para serializar entities/joins de catálogo para o formato JSON
 * que o frontend (Next.js) consome.
 */

export const presentVariantValue = (av: VariantAttributeValue) => ({
  attributeId: av.attributeId,
  attributeSlug: av.attributeSlug,
  attributeName: av.attributeName,
  attributeType: av.attributeType,
  valueId: av.valueId,
  valueSlug: av.valueSlug,
  valueName: av.valueName,
  valueHex: av.valueHex,
});

export const presentVariant = (v: any, values: VariantAttributeValue[] = []) => ({
  id: v.id.toString(),
  sku: v.sku,
  priceCents: v.price,
  stock: v.stock,
  inStock: v.stock > 0,
  isActive: v.isActive,
  weightInGrams: v.weightInGrams ?? null,
  isDefault: v.isDefault ?? false,
  attributeValues: values.map(presentVariantValue),
});

export const presentImage = (i: any) => ({
  id: i.id.toString(),
  url: i.url,
  alt: i.alt,
  order: i.order,
  variantId: i.variantId ? i.variantId.toString() : null,
});

export const presentProductListItem = (item: ProductListItem) => {
  const variants = item.variants.map((v) => presentVariant(v, item.variantValues[v.id.toString()] ?? []));
  const prices = variants.filter((v) => v.isActive).map((v) => v.priceCents);
  const stockSum = variants.reduce((acc, v) => acc + v.stock, 0);
  const primaryImage = item.images[0];
  return {
    id: item.product.id.toString(),
    slug: item.product.slug,
    name: item.product.name,
    description: item.product.description,
    status: item.product.status,
    type: item.product.type,
    basePriceCents: item.product.basePrice,
    priceFromCents: prices.length ? Math.min(...prices) : item.product.basePrice,
    priceToCents: prices.length ? Math.max(...prices) : item.product.basePrice,
    inStock: stockSum > 0,
    totalStock: stockSum,
    category: { slug: item.categorySlug, name: item.categoryName },
    image: primaryImage ? presentImage(primaryImage) : null,
    images: item.images.map(presentImage),
    variants,
  };
};

export const presentProductDetails = (details: ProductDetails) => {
  const base = presentProductListItem({
    product: details.product,
    variants: details.variants,
    variantValues: details.variantValues,
    images: details.images,
    categorySlug: details.categorySlug,
    categoryName: details.categoryName,
  });
  return {
    ...base,
    attributes: details.attributes,
    weightInGrams: details.product.weightInGrams,
    dimensions:
      details.product.dimensionLength ||
      details.product.dimensionWidth ||
      details.product.dimensionHeight
        ? {
            length: details.product.dimensionLength,
            width: details.product.dimensionWidth,
            height: details.product.dimensionHeight,
          }
        : null,
    seoTitle: details.product.seoTitle,
    seoDescription: details.product.seoDescription,
    tags: details.tags,
  };
};
