import { describe, it, expect } from 'vitest';
import { Money } from './Money.vo';

describe('Money', () => {
  it('fromCents() exige inteiro', () => {
    expect(Money.fromCents(1234).cents).toBe(1234);
    expect(() => Money.fromCents(1.5)).toThrow();
  });

  it('rejeita valor negativo', () => {
    expect(() => Money.fromCents(-1)).toThrow(/negative/);
  });

  it('fromBRL() converte arredondando', () => {
    expect(Money.fromBRL(12.34).cents).toBe(1234);
    expect(Money.fromBRL(0.1 + 0.2).cents).toBe(30);
  });

  it('add() e subtract() operam em cents', () => {
    const a = Money.fromCents(500);
    const b = Money.fromCents(200);
    expect(a.add(b).cents).toBe(700);
    expect(a.subtract(b).cents).toBe(300);
  });

  it('multiply() arredonda', () => {
    expect(Money.fromCents(100).multiply(0.075).cents).toBe(8);
  });

  it('toFormatted() formata em pt-BR', () => {
    const formatted = Money.fromCents(12990).toFormatted();
    expect(formatted).toContain('129,90');
  });
});
