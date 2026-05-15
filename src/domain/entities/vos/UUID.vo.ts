import { randomUUID } from 'crypto';

export class UUID {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  public static generate(): UUID {
    return new UUID(randomUUID());
  }

  public static from(value: string): UUID {
    return new UUID(value);
  }

  get value(): string {
    return this._value;
  }

  public equals(other: UUID): boolean {
    return this._value === other.value;
  }

  public toString(): string {
    return this._value;
  }
}
