import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConflictException } from '@nestjs/common';
import { CreateCollectionUseCase } from './create-collection.use-case';
import { ICollectionRepository } from '../../repositories/collection.repository';

const makeRepo = (): ICollectionRepository => ({
  list: vi.fn(),
  findBySlug: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  addProduct: vi.fn(),
  removeProduct: vi.fn(),
}) as unknown as ICollectionRepository;

describe('CreateCollectionUseCase', () => {
  let repo: ICollectionRepository;
  let useCase: CreateCollectionUseCase;

  beforeEach(() => {
    repo = makeRepo();
    useCase = new CreateCollectionUseCase(repo);
  });

  it('creates a collection when slug is available', async () => {
    vi.mocked(repo.findBySlug).mockResolvedValue(null);
    vi.mocked(repo.create).mockResolvedValue(undefined);

    const result = await useCase.execute({ name: 'Verão 2025', slug: 'verao-2025' });

    expect(repo.create).toHaveBeenCalledOnce();
    expect(result.name).toBe('Verão 2025');
    expect(result.slug).toBe('verao-2025');
  });

  it('throws ConflictException when slug already exists', async () => {
    vi.mocked(repo.findBySlug).mockResolvedValue({
      collection: {} as any,
      products: [],
    });

    await expect(
      useCase.execute({ name: 'Verão 2025', slug: 'verao-2025' }),
    ).rejects.toThrow(ConflictException);

    expect(repo.create).not.toHaveBeenCalled();
  });
});
