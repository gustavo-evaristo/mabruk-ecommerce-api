import { Injectable, NotFoundException } from '@nestjs/common';
import { IPromotionRepository } from 'src/domain/repositories/promotion.repository';
import {
  DiscountType,
  PromotionEntity,
  PromotionStatus,
  PromotionType,
} from 'src/domain/entities/promotion.entity';

interface CreateInput {
  type: PromotionType;
  name: string;
  code?: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  scope?: string;
  usesMax?: number;
  startsAt?: Date;
  expiresAt?: Date;
  status?: PromotionStatus;
}

@Injectable()
export class ListPromotionsUseCase {
  constructor(private readonly repo: IPromotionRepository) {}
  async execute(type?: PromotionType): Promise<PromotionEntity[]> {
    return this.repo.list({ type });
  }
}

@Injectable()
export class GetPromotionUseCase {
  constructor(private readonly repo: IPromotionRepository) {}
  async execute(id: string): Promise<PromotionEntity> {
    const p = await this.repo.get(id);
    if (!p) throw new NotFoundException('Promotion not found');
    return p;
  }
}

@Injectable()
export class CreatePromotionUseCase {
  constructor(private readonly repo: IPromotionRepository) {}
  async execute(input: CreateInput): Promise<PromotionEntity> {
    const p = new PromotionEntity(input);
    await this.repo.create(p);
    return p;
  }
}

interface UpdateInput extends Partial<CreateInput> {
  id: string;
}

@Injectable()
export class UpdatePromotionUseCase {
  constructor(private readonly repo: IPromotionRepository) {}
  async execute(input: UpdateInput): Promise<PromotionEntity> {
    const p = await this.repo.get(input.id);
    if (!p) throw new NotFoundException('Promotion not found');
    p.update(input);
    await this.repo.update(p);
    return p;
  }
}

@Injectable()
export class DeletePromotionUseCase {
  constructor(private readonly repo: IPromotionRepository) {}
  async execute(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}

interface ValidateCouponInput {
  code: string;
  subtotalCents: number;
}

@Injectable()
export class ValidateCouponUseCase {
  constructor(private readonly repo: IPromotionRepository) {}

  async execute(input: ValidateCouponInput): Promise<{
    promotion: PromotionEntity;
    discountCents: number;
  }> {
    const p = await this.repo.findByCode(input.code);
    if (!p) throw new NotFoundException('Cupom não encontrado');
    if (p.status !== 'ACTIVE') throw new Error('Cupom indisponível');
    const now = new Date();
    if (p.startsAt && p.startsAt > now) throw new Error('Cupom ainda não está ativo');
    if (p.expiresAt && p.expiresAt < now) throw new Error('Cupom expirado');
    if (p.usesMax !== null && p.usesCount >= p.usesMax) {
      throw new Error('Cupom esgotado');
    }

    let discountCents = 0;
    if (p.discountType === 'PERCENT') {
      discountCents = Math.round((input.subtotalCents * p.discountValue) / 100);
    } else if (p.discountType === 'FIXED_CENTS') {
      discountCents = Math.min(p.discountValue, input.subtotalCents);
    } else if (p.discountType === 'FREE_SHIPPING') {
      discountCents = 0; // o caller usa flag para zerar shipping
    }

    return { promotion: p, discountCents };
  }
}
