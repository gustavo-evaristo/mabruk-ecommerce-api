import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { IAddressRepository } from 'src/domain/repositories/address.repository';
import { AddressEntity } from 'src/domain/entities/address.entity';
import { CEP } from 'src/domain/entities/vos';

@Injectable()
export class ListCustomerAddressesUseCase {
  constructor(private readonly repository: IAddressRepository) {}
  async execute(customerId: string): Promise<AddressEntity[]> {
    return this.repository.listByCustomerId(customerId);
  }
}

interface CreateAddressInput {
  customerId: string;
  label?: string;
  recipient: string;
  zipCode: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  isDefault?: boolean;
}

@Injectable()
export class CreateCustomerAddressUseCase {
  constructor(private readonly repository: IAddressRepository) {}
  async execute(input: CreateAddressInput): Promise<AddressEntity> {
    const zip = CEP.create(input.zipCode).value;
    if (input.isDefault) {
      await this.repository.unsetDefaultForCustomer(input.customerId);
    }
    const existing = await this.repository.listByCustomerId(input.customerId);
    const isFirst = existing.length === 0;
    const a = new AddressEntity({ ...input, zipCode: zip, isDefault: input.isDefault ?? isFirst });
    await this.repository.create(a);
    return a;
  }
}

interface UpdateAddressInput extends Partial<CreateAddressInput> {
  id: string;
  customerId: string;
}

@Injectable()
export class UpdateCustomerAddressUseCase {
  constructor(private readonly repository: IAddressRepository) {}
  async execute(input: UpdateAddressInput): Promise<AddressEntity> {
    const a = await this.repository.get(input.id);
    if (!a) throw new NotFoundException('Address not found');
    if (a.customerId.toString() !== input.customerId) throw new ForbiddenException();

    if (input.zipCode) input.zipCode = CEP.create(input.zipCode).value;
    if (input.isDefault) {
      await this.repository.unsetDefaultForCustomer(input.customerId);
    }
    a.update(input);
    await this.repository.update(a);
    return a;
  }
}

interface DeleteAddressInput {
  id: string;
  customerId: string;
}

@Injectable()
export class DeleteCustomerAddressUseCase {
  constructor(private readonly repository: IAddressRepository) {}
  async execute(input: DeleteAddressInput): Promise<void> {
    const a = await this.repository.get(input.id);
    if (!a) throw new NotFoundException('Address not found');
    if (a.customerId.toString() !== input.customerId) throw new ForbiddenException();
    await this.repository.delete(input.id);
  }
}
