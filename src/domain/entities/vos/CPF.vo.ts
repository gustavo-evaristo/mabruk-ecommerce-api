/**
 * CPF — validação estrutural simples (tamanho + checksum).
 * No MVP não validamos formal-mente cada dígito porque CPF é opcional;
 * apenas normalizamos e validamos comprimento.
 */
export class CPF {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  public static create(value: string): CPF {
    const digits = (value ?? '').replace(/\D/g, '');
    if (digits.length !== 11) {
      throw new Error('CPF must have 11 digits');
    }
    if (/^(\d)\1{10}$/.test(digits)) {
      throw new Error('Invalid CPF');
    }
    return new CPF(digits);
  }

  get value(): string {
    return this._value;
  }

  toFormatted(): string {
    return `${this._value.slice(0, 3)}.${this._value.slice(3, 6)}.${this._value.slice(6, 9)}-${this._value.slice(9)}`;
  }

  toString(): string {
    return this._value;
  }
}
