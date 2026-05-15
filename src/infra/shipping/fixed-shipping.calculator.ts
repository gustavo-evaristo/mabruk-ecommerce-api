import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  CreateLabelInput,
  CreateLabelOutput,
  ShippingCalculator,
  ShippingQuote,
  ShippingQuoteInput,
} from 'src/domain/services/shipping-calculator';

/**
 * Calculadora de frete fake para MVP.
 *
 * Regras:
 * - Frete grátis se subtotal >= FREE_SHIPPING_THRESHOLD_CENTS (env, default 29900)
 * - Tabela por região:
 *   - SP/RJ/MG/ES (Sudeste): R$ 15 PAC / R$ 25 SEDEX
 *   - PR/SC/RS (Sul): R$ 20 PAC / R$ 32 SEDEX
 *   - Demais: R$ 30 PAC / R$ 45 SEDEX
 *
 * Substituir por MelhorEnvioShippingCalculator quando integrar.
 */
@Injectable()
export class FixedShippingCalculator extends ShippingCalculator {
  readonly providerName = 'fake-fixed-table';
  private readonly logger = new Logger(FixedShippingCalculator.name);

  private resolveRegion(cep: string): 'SE' | 'S' | 'OTHER' {
    const digits = cep.replace(/\D/g, '');
    const prefix = parseInt(digits.slice(0, 2), 10);
    // Faixas oficiais do CEP brasileiro
    if (prefix >= 1 && prefix <= 39) return 'SE'; // SP, RJ, ES, MG
    if (prefix >= 80 && prefix <= 99) return 'S'; // PR, SC, RS
    return 'OTHER';
  }

  async quote(input: ShippingQuoteInput): Promise<ShippingQuote[]> {
    const threshold = Number(process.env.FREE_SHIPPING_THRESHOLD_CENTS ?? 29900);
    const region = this.resolveRegion(input.toZip);

    const table: Record<typeof region, { pac: number; sedex: number; pacDays: number; sedexDays: number }> = {
      SE: { pac: 1500, sedex: 2500, pacDays: 5, sedexDays: 2 },
      S: { pac: 2000, sedex: 3200, pacDays: 7, sedexDays: 3 },
      OTHER: { pac: 3000, sedex: 4500, pacDays: 10, sedexDays: 5 },
    };

    const row = table[region];
    const free = input.subtotalCents >= threshold;

    this.logger.log(
      `[FixedShipping] zip=${input.toZip} region=${region} subtotal=${input.subtotalCents} free=${free}`,
    );

    return [
      {
        service: 'PAC',
        carrier: 'Correios',
        costCents: free ? 0 : row.pac,
        estimatedDays: row.pacDays,
        free,
      },
      {
        service: 'SEDEX',
        carrier: 'Correios',
        costCents: row.sedex,
        estimatedDays: row.sedexDays,
        free: false,
      },
    ];
  }

  async createLabel(input: CreateLabelInput): Promise<CreateLabelOutput> {
    this.logger.log(
      `[FixedShipping] Etiqueta simulada para order=${input.orderNumber} (${input.carrier}/${input.service})`,
    );
    return {
      externalOrderId: `lbl_${randomUUID()}`,
      trackingCode: undefined, // simulação sem rastreio automático
    };
  }
}
