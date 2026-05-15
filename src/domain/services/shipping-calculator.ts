export interface ShippingQuoteItem {
  weightInGrams: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  valueCents: number;
  quantity: number;
}

export interface ShippingQuoteInput {
  fromZip: string;
  toZip: string;
  items: ShippingQuoteItem[];
  subtotalCents: number; // para aplicar regra de frete grátis
}

export interface ShippingQuote {
  service: string;
  carrier: string;
  costCents: number;
  estimatedDays: number;
  free?: boolean;
}

export interface CreateLabelInput {
  orderId: string;
  orderNumber: string;
  service: string;
  carrier: string;
}

export interface CreateLabelOutput {
  externalOrderId: string;
  trackingCode?: string;
}

export abstract class ShippingCalculator {
  abstract readonly providerName: string;
  abstract quote(input: ShippingQuoteInput): Promise<ShippingQuote[]>;
  abstract createLabel(input: CreateLabelInput): Promise<CreateLabelOutput>;
}
