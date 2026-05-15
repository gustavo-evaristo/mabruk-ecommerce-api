import { describe, it, expect, vi } from 'vitest';
import { Password } from './Password.vo';

vi.mock('bcrypt', () => ({
  hashSync: vi.fn((v: string) => `hashed:${v}`),
  compareSync: vi.fn((v: string, h: string) => h === `hashed:${v}`),
}));

describe('Password', () => {
  describe('create()', () => {
    it('cria senha válida', () => {
      const pw = Password.create('abc123@');
      expect(pw.value).toBe('abc123@');
    });

    it('rejeita senha curta', () => {
      expect(() => Password.create('a@1')).toThrow(/at least/);
    });

    it('rejeita senha sem caractere especial', () => {
      expect(() => Password.create('abcdef')).toThrow(/special/);
    });
  });

  describe('createWithConfirmation()', () => {
    it('aceita senhas iguais', () => {
      const pw = Password.createWithConfirmation('abc123@', 'abc123@');
      expect(pw.value).toBe('abc123@');
    });

    it('rejeita senhas diferentes', () => {
      expect(() =>
        Password.createWithConfirmation('abc123@', 'xyz123@'),
      ).toThrow(/do not match/);
    });
  });

  describe('hash() e compareWithHash()', () => {
    it('hash gera string e compara corretamente', () => {
      const pw = Password.create('abc123@');
      const h = pw.hash();
      expect(h).toBe('hashed:abc123@');
      expect(pw.compareWithHash(h)).toBe(true);
      expect(pw.compareWithHash('hashed:wrong')).toBe(false);
    });
  });

  describe('fromHash()', () => {
    it('cria Password a partir de um hash existente sem validar', () => {
      const pw = Password.fromHash('any-hash');
      expect(pw.value).toBe('any-hash');
    });
  });
});
