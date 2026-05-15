import { Password, UUID } from './vos';

export type AdminRole = 'OWNER' | 'STAFF';

type AdminEntityProps = {
  id?: UUID | string | null;
  name: string;
  email: string;
  password: string | Password;
  role?: AdminRole;
  isActive?: boolean;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export class AdminEntity {
  id: UUID;
  name: string;
  email: string;
  password: Password;
  role: AdminRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: AdminEntityProps) {
    if (props.id instanceof UUID) {
      this.id = props.id;
    } else if (typeof props.id === 'string') {
      this.id = UUID.from(props.id);
    } else {
      this.id = UUID.generate();
    }
    this.name = props.name;
    this.email = props.email;

    if (props.password instanceof Password) {
      this.password = props.password;
    } else {
      this.password = Password.create(props.password);
    }

    this.role = props.role ?? 'OWNER';
    this.isActive = props.isActive ?? true;

    const createdAt = props.createdAt || new Date();
    this.createdAt = createdAt;
    this.updatedAt = props.updatedAt || createdAt;
  }

  private touch() {
    this.updatedAt = new Date();
  }

  changePassword(newPassword: string) {
    this.password = Password.create(newPassword);
    this.touch();
  }
}
