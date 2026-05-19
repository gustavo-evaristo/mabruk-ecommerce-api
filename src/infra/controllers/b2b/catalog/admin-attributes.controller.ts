import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminJwtGuard } from 'src/infra/authentication/admin-jwt.guard';
import {
  CreateAttributeUseCase,
  CreateAttributeValueUseCase,
  DeleteAttributeUseCase,
  DeleteAttributeValueUseCase,
  ListAttributesUseCase,
  UpdateAttributeUseCase,
  UpdateAttributeValueUseCase,
} from 'src/domain/use-cases/admin-catalog';
import {
  CreateAttributeDTO,
  CreateAttributeValueDTO,
  UpdateAttributeDTO,
  UpdateAttributeValueDTO,
} from 'src/infra/dtos/admin-catalog/attribute.dtos';
import {
  presentAttribute,
  presentAttributeValue,
} from 'src/infra/controllers/presenters/attribute.presenter';

@ApiTags('B2B / Catalog / Attributes')
@ApiBearerAuth()
@UseGuards(AdminJwtGuard)
@Controller('b2b/attributes')
export class AdminAttributesController {
  constructor(
    private readonly listAll: ListAttributesUseCase,
    private readonly createAttr: CreateAttributeUseCase,
    private readonly updateAttr: UpdateAttributeUseCase,
    private readonly deleteAttr: DeleteAttributeUseCase,
    private readonly createValue: CreateAttributeValueUseCase,
    private readonly updateValue: UpdateAttributeValueUseCase,
    private readonly deleteValue: DeleteAttributeValueUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lista atributos com seus valores' })
  async list() {
    const items = await this.listAll.execute();
    return { items: items.map((x) => presentAttribute(x.attribute, x.values)) };
  }

  @Post()
  async create(@Body() body: CreateAttributeDTO) {
    const attr = await this.createAttr.execute({
      name: body.name,
      slug: body.slug,
      type: body.type,
      valueDrafts: body.valueDrafts?.map((v) => ({ name: v.name, slug: v.slug, hex: v.hex })),
    });
    return { id: attr.id.toString(), slug: attr.slug };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateAttributeDTO) {
    const attr = await this.updateAttr.execute({ id, ...body });
    return presentAttribute(attr);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.deleteAttr.execute(id);
    return { ok: true };
  }

  @Post(':id/values')
  async addValue(@Param('id') attributeId: string, @Body() body: CreateAttributeValueDTO) {
    const v = await this.createValue.execute({ attributeId, ...body });
    return presentAttributeValue(v);
  }

  @Patch(':id/values/:valueId')
  async editValue(
    @Param('valueId') valueId: string,
    @Body() body: UpdateAttributeValueDTO,
  ) {
    const v = await this.updateValue.execute({ valueId, ...body });
    return presentAttributeValue(v);
  }

  @Delete(':id/values/:valueId')
  async removeValue(@Param('valueId') valueId: string) {
    await this.deleteValue.execute(valueId);
    return { ok: true };
  }
}
