import { UUID } from './vos';

type AddressEntityProps = {
  id?: UUID | string | null;
  customerId: UUID | string;
  label?: string | null;
  recipient: string;
  zipCode: string;
  street: string;
  number: string;
  complement?: string | null;
  neighborhood: string;
  city: string;
  state: string;
  isDefault?: boolean;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export class AddressEntity {
  id: UUID;
  customerId: UUID;
  label: string | null;
  recipient: string;
  zipCode: string;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: AddressEntityProps) {
    if (props.id instanceof UUID) {
      this.id = props.id;
    } else if (typeof props.id === 'string') {
      this.id = UUID.from(props.id);
    } else {
      this.id = UUID.generate();
    }
    this.customerId =
      props.customerId instanceof UUID ? props.customerId : UUID.from(props.customerId);
    this.label = props.label ?? null;
    this.recipient = props.recipient;
    this.zipCode = props.zipCode;
    this.street = props.street;
    this.number = props.number;
    this.complement = props.complement ?? null;
    this.neighborhood = props.neighborhood;
    this.city = props.city;
    this.state = props.state;
    this.isDefault = props.isDefault ?? false;

    const createdAt = props.createdAt || new Date();
    this.createdAt = createdAt;
    this.updatedAt = props.updatedAt || createdAt;
  }

  private touch() {
    this.updatedAt = new Date();
  }

  update(props: Partial<AddressEntityProps>) {
    if (props.label !== undefined) this.label = props.label ?? null;
    if (props.recipient !== undefined) this.recipient = props.recipient;
    if (props.zipCode !== undefined) this.zipCode = props.zipCode;
    if (props.street !== undefined) this.street = props.street;
    if (props.number !== undefined) this.number = props.number;
    if (props.complement !== undefined) this.complement = props.complement ?? null;
    if (props.neighborhood !== undefined) this.neighborhood = props.neighborhood;
    if (props.city !== undefined) this.city = props.city;
    if (props.state !== undefined) this.state = props.state;
    if (props.isDefault !== undefined) this.isDefault = props.isDefault;
    this.touch();
  }
}
