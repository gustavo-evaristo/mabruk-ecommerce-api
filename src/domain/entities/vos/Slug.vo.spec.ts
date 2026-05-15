import { describe, it, expect } from 'vitest';
import { Slug } from './Slug.vo';

describe('Slug', () => {
  it('converte texto livre em slug', () => {
    expect(Slug.fromText('Colar Lira Ouro 18k').value).toBe('colar-lira-ouro-18k');
  });

  it('remove acentos', () => {
    expect(Slug.fromText('Coração de Pérola').value).toBe('coracao-de-perola');
  });

  it('rejeita string vazia', () => {
    expect(() => Slug.fromText('   ')).toThrow();
    expect(() => Slug.fromText('!!!')).toThrow();
  });

  it('mantém valor existente via from()', () => {
    expect(Slug.from('colar-flor').value).toBe('colar-flor');
  });
});
