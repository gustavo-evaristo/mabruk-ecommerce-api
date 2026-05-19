import { Injectable, NotFoundException } from '@nestjs/common';
import { IProductRepository } from 'src/domain/repositories/product.repository';

@Injectable()
export class DeleteProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  /** Soft delete: produto vai para a lixeira por 30 dias antes de ser apagado por cron. */
  async execute(id: string): Promise<void> {
    const product = await this.productRepository.get(id);
    if (!product) throw new NotFoundException('Product not found');
    await this.productRepository.delete(id);
  }
}
