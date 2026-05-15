/**
 * Money — sempre em centavos. Evita perda de precisão.
 */
export class Money {
  private readonly _cents: number;

  private constructor(cents: number) {
    this._cents = cents;
  }

  public static fromCents(cents: number): Money {
    if (!Number.isInteger(cents)) {
      throw new Error('Money amount in cents must be an integer');
    }
    if (cents < 0) {
      throw new Error('Money amount cannot be negative');
    }
    return new Money(cents);
  }

  public static fromBRL(brl: number): Money {
    return Money.fromCents(Math.round(brl * 100));
  }

  public static zero(): Money {
    return new Money(0);
  }

  get cents(): number {
    return this._cents;
  }

  get brl(): number {
    return this._cents / 100;
  }

  add(other: Money): Money {
    return new Money(this._cents + other.cents);
  }

  subtract(other: Money): Money {
    return Money.fromCents(this._cents - other.cents);
  }

  multiply(factor: number): Money {
    return Money.fromCents(Math.round(this._cents * factor));
  }

  toFormatted(): string {
    return this.brl.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }
}
