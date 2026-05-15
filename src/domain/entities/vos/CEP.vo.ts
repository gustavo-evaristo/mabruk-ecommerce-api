export class CEP {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  public static create(value: string): CEP {
    const digits = (value ?? '').replace(/\D/g, '');
    if (digits.length !== 8) {
      throw new Error('CEP must have 8 digits');
    }
    return new CEP(digits);
  }

  get value(): string {
    return this._value;
  }

  toFormatted(): string {
    return `${this._value.slice(0, 5)}-${this._value.slice(5)}`;
  }

  toString(): string {
    return this._value;
  }
}
