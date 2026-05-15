import { AddressEntity } from '../entities/address.entity';

export abstract class IAddressRepository {
  abstract listByCustomerId(customerId: string): Promise<AddressEntity[]>;
  abstract get(id: string): Promise<AddressEntity | null>;
  abstract create(address: AddressEntity): Promise<void>;
  abstract update(address: AddressEntity): Promise<void>;
  abstract delete(id: string): Promise<void>;
  abstract unsetDefaultForCustomer(customerId: string): Promise<void>;
}
