import { describe, it, expect } from 'vitest';
import { Email } from './Email.vo';

describe('Email', () => {
  it('aceita e normaliza email válido', () => {
    const email = Email.create('  Ana@TESTE.COM ');
    expect(email.value).toBe('ana@teste.com');
  });

  it('rejeita formato inválido', () => {
    expect(() => Email.create('semarroba.com')).toThrow(/Invalid email/);
    expect(() => Email.create('')).toThrow();
  });
});
