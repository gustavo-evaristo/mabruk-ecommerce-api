export class Email {
  private readonly _value: string;

  private static readonly REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  private constructor(value: string) {
    this._value = value;
  }

  public static create(value: string): Email {
    const normalized = (value ?? '').trim().toLowerCase();
    if (!this.REGEX.test(normalized)) {
      throw new Error('Invalid email address');
    }
    return new Email(normalized);
  }

  get value(): string {
    return this._value;
  }

  toString(): string {
    return this._value;
  }
}
