import { describe, it, expect } from 'vitest';
import { CEP } from './CEP.vo';

describe('CEP', () => {
  it('normaliza removendo não-dígitos', () => {
    expect(CEP.create('01310-100').value).toBe('01310100');
  });

  it('rejeita CEP com tamanho inválido', () => {
    expect(() => CEP.create('123')).toThrow();
    expect(() => CEP.create('123456789')).toThrow();
  });

  it('toFormatted() devolve com hífen', () => {
    expect(CEP.create('01310100').toFormatted()).toBe('01310-100');
  });
});
