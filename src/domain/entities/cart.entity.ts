import { UUID } from './vos';

type CartEntityProps = {
  id?: UUID | string | null;
  customerId?: UUID | string | null;
  guestToken?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export class CartEntity {
  id: UUID;
  customerId: UUID | null;
  guestToken: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: CartEntityProps) {
    if (props.id instanceof UUID) {
      this.id = props.id;
    } else if (typeof props.id === 'string') {
      this.id = UUID.from(props.id);
    } else {
      this.id = UUID.generate();
    }

    if (!props.customerId) {
      this.customerId = null;
    } else if (props.customerId instanceof UUID) {
      this.customerId = props.customerId;
    } else {
      this.customerId = UUID.from(props.customerId);
    }

    this.guestToken = props.guestToken ?? null;

    const createdAt = props.createdAt || new Date();
    this.createdAt = createdAt;
    this.updatedAt = props.updatedAt || createdAt;
  }

  private touch() {
    this.updatedAt = new Date();
  }

  assignToCustomer(customerId: UUID | string) {
    this.customerId = customerId instanceof UUID ? customerId : UUID.from(customerId);
    this.touch();
  }

  /**
   * Verifica se o requester pode acessar este carrinho.
   * - Se cart pertence a um customer: customer logado tem que bater
   * - Se cart é guest: header X-Cart-Token tem que bater
   */
  canBeAccessedBy(input: { customerId?: string | null; guestToken?: string | null }): boolean {
    if (this.customerId) {
      return !!input.customerId && this.customerId.toString() === input.customerId;
    }
    return !!input.guestToken && this.guestToken === input.guestToken;
  }
}
