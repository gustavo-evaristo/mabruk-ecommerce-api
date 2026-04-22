import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { IsString, IsOptional } from 'class-validator';
import { ListCollectionsUseCase } from '../../../domain/use-cases/collections/list-collections.use-case';
import { GetCollectionUseCase } from '../../../domain/use-cases/collections/get-collection.use-case';
import { CreateCollectionUseCase } from '../../../domain/use-cases/collections/create-collection.use-case';

class CreateCollectionDto {
  @IsString() name: string;
  @IsString() slug: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() coverImage?: string;
}

@Controller('collections')
export class CollectionsController {
  constructor(
    private readonly listCollections: ListCollectionsUseCase,
    private readonly getCollection: GetCollectionUseCase,
    private readonly createCollection: CreateCollectionUseCase,
  ) {}

  @Get()
  async list() {
    return this.listCollections.execute();
  }

  @Get(':slug')
  async getOne(@Param('slug') slug: string) {
    return this.getCollection.execute(slug);
  }

  @Post()
  async create(@Body() body: CreateCollectionDto) {
    return this.createCollection.execute(body);
  }
}
