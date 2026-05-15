import { describe, it, expect } from 'vitest';
import { UUID } from './UUID.vo';

describe('UUID', () => {
  it('generate() retorna instância UUID com valor único', () => {
    const a = UUID.generate();
    const b = UUID.generate();
    expect(a).toBeInstanceOf(UUID);
    expect(a.toString()).not.toBe(b.toString());
  });

  it('from(value) preserva o valor', () => {
    const uuid = UUID.from('abc-123');
    expect(uuid.value).toBe('abc-123');
    expect(uuid.toString()).toBe('abc-123');
  });

  it('equals() compara por valor', () => {
    const a = UUID.from('same');
    const b = UUID.from('same');
    const c = UUID.from('other');
    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });
});
