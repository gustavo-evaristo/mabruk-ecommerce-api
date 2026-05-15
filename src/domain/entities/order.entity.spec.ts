import { describe, it, expect } from 'vitest';
import { OrderEntity } from './order.entity';

const baseProps = () => ({
  number: 'MBK-000001',
  customerSnapshot: { name: 'Ana', email: 'ana@test.com' },
  itemsTotal: 10000,
  grandTotal: 10000,
  shippingAddress: {
    recipient: 'Ana',
    zipCode: '01310100',
    street: 'Av. Paulista',
    number: '1000',
    neighborhood: 'Bela Vista',
    city: 'São Paulo',
    state: 'SP',
  },
});

describe('OrderEntity transitionTo', () => {
  it('PENDING_PAYMENT → PAID é permitido', () => {
    const order = new OrderEntity(baseProps());
    order.transitionTo('PAID');
    expect(order.status).toBe('PAID');
  });

  it('PAID → PREPARING é permitido', () => {
    const order = new OrderEntity({ ...baseProps(), status: 'PAID' });
    order.transitionTo('PREPARING');
    expect(order.status).toBe('PREPARING');
  });

  it('PREPARING → SHIPPED → DELIVERED é permitido', () => {
    const order = new OrderEntity({ ...baseProps(), status: 'PREPARING' });
    order.transitionTo('SHIPPED');
    order.transitionTo('DELIVERED');
    expect(order.status).toBe('DELIVERED');
  });

  it('rejeita transição inválida', () => {
    const order = new OrderEntity(baseProps());
    expect(() => order.transitionTo('DELIVERED')).toThrow(/Invalid order status transition/);
  });

  it('CANCELED é terminal', () => {
    const order = new OrderEntity({ ...baseProps(), status: 'CANCELED' });
    expect(() => order.transitionTo('PAID')).toThrow();
  });
});
