import { Controller, Get, Param, NotFoundException, BadRequestException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

/**
 * Wrapper público sobre o ViaCEP. Útil pro frontend evitar CORS direto
 * e padronizar o shape de resposta.
 */
@ApiTags('B2C / Utils / CEP')
@Controller('b2c/cep')
export class CepController {
  @Get(':zip')
  @ApiOperation({ summary: 'Consulta CEP via ViaCEP' })
  async lookup(@Param('zip') zip: string) {
    const digits = (zip ?? '').replace(/\D/g, '');
    if (digits.length !== 8) throw new BadRequestException('CEP deve ter 8 dígitos');

    const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
    if (!res.ok) throw new NotFoundException('CEP não encontrado');
    const data: any = await res.json();
    if (data.erro) throw new NotFoundException('CEP não encontrado');

    return {
      zipCode: digits,
      street: data.logradouro ?? '',
      neighborhood: data.bairro ?? '',
      city: data.localidade ?? '',
      state: data.uf ?? '',
      complement: data.complemento ?? null,
    };
  }
}
