import { Injectable } from '@nestjs/common';
import { ITagRepository } from 'src/domain/repositories/tag.repository';
import { TagEntity } from 'src/domain/entities/tag.entity';

@Injectable()
export class ListTagsUseCase {
  constructor(private readonly tagRepository: ITagRepository) {}

  async execute(): Promise<TagEntity[]> {
    return this.tagRepository.list();
  }
}
