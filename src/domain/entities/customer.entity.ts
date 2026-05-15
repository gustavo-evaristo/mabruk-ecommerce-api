import { Password, UUID } from './vos';

type CustomerEntityProps = {
  id?: UUID | string | null;
  name: string;
  email: string;
  phone?: string | null;
  cpfCnpj?: string | null;
  password: string | Password;
  emailVerified?: boolean;
  isActive?: boolean;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export class CustomerEntity {
  id: UUID;
  name: string;
  email: string;
  phone: string | null;
  cpfCnpj: string | null;
  password: Password;
  emailVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: CustomerEntityProps) {
    if (props.id instanceof UUID) {
      this.id = props.id;
    } else if (typeof props.id === 'string') {
      this.id = UUID.from(props.id);
    } else {
      this.id = UUID.generate();
    }
    this.name = props.name;
    this.email = props.email;
    this.phone = props.phone ?? null;
    this.cpfCnpj = props.cpfCnpj ?? null;

    if (props.password instanceof Password) {
      this.password = props.password;
    } else {
      this.password = Password.create(props.password);
    }

    this.emailVerified = props.emailVerified ?? false;
    this.isActive = props.isActive ?? true;

    const createdAt = props.createdAt || new Date();
    this.createdAt = createdAt;
    this.updatedAt = props.updatedAt || createdAt;
  }

  private touch() {
    this.updatedAt = new Date();
  }

  updateProfile(props: { name?: string; phone?: string | null; cpfCnpj?: string | null }) {
    if (props.name !== undefined) this.name = props.name;
    if (props.phone !== undefined) this.phone = props.phone ?? null;
    if (props.cpfCnpj !== undefined) this.cpfCnpj = props.cpfCnpj ?? null;
    this.touch();
  }

  changePassword(newPassword: string) {
    this.password = Password.create(newPassword);
    this.touch();
  }
}
