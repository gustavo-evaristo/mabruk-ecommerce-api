import { Injectable } from '@nestjs/common';
import { ISettingRepository } from '../repositories/setting.repository';

/**
 * Lê configurações dinâmicas da loja a partir da tabela `settings`.
 * Cada getter tem fallback hardcoded caso a setting não exista no banco.
 *
 * As chaves espelham as expostas no painel /admin/configuracoes:
 *  - shipping.originZip
 *  - shipping.freeShippingThresholdCents
 *  - payment.maxInstallments
 */
@Injectable()
export class StoreConfigService {
  constructor(private readonly settings: ISettingRepository) {}

  private async readNumber(group: string, key: string, fallback: number): Promise<number> {
    const setting = await this.settings.get(group, key);
    if (!setting) return fallback;
    const raw = setting.value;
    const n = typeof raw === 'number' ? raw : Number(raw);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  }

  private async readString(group: string, key: string, fallback: string): Promise<string> {
    const setting = await this.settings.get(group, key);
    if (!setting) return fallback;
    const raw = setting.value;
    if (typeof raw !== 'string' || !raw.trim()) return fallback;
    return raw.trim();
  }

  async getOriginZip(): Promise<string> {
    const value = await this.readString('shipping', 'originZip', '08421108');
    return value.replace(/\D/g, '') || '08421108';
  }

  async getFreeShippingThresholdCents(): Promise<number> {
    return this.readNumber('shipping', 'freeShippingThresholdCents', 30000);
  }

  async getMaxInstallments(): Promise<number> {
    return this.readNumber('payment', 'maxInstallments', 6);
  }
}
