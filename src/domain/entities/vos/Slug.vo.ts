export class Slug {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  public static fromText(text: string): Slug {
    const value = text
      .toString()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    if (!value) {
      throw new Error('Slug cannot be empty');
    }

    return new Slug(value);
  }

  public static from(value: string): Slug {
    return new Slug(value);
  }

  get value(): string {
    return this._value;
  }

  toString(): string {
    return this._value;
  }
}
