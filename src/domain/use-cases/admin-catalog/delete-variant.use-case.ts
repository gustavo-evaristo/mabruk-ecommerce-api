import { Injectable, NotFoundException } from '@nestjs/common';
import { IProductVariantRepository } from 'src/domain/repositories/product-variant.repository';

@Injectable()
export class DeleteVariantUseCase {
  constructor(private readonly variantRepository: IProductVariantRepository) {}

  async execute(id: string): Promise<void> {
    const v = await this.variantRepository.get(id);
    if (!v) throw new NotFoundException('Variant not found');
    await this.variantRepository.delete(id);
  }
}
