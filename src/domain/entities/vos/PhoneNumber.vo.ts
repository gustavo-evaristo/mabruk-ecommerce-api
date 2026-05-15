export class PhoneNumber {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  public static create(value: string): PhoneNumber {
    const digits = (value ?? '').replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 13) {
      throw new Error('Phone number must have between 10 and 13 digits');
    }
    return new PhoneNumber(digits);
  }

  get value(): string {
    return this._value;
  }

  toString(): string {
    return this._value;
  }
}
