/**
 * Settings da loja em formato chave-valor por grupo.
 * Cada (group, key) é único. Value é JSON livre (string/number/bool/object).
 */

type SettingEntityProps = {
  group: string;
  key: string;
  value: unknown;
  updatedAt?: Date | null;
};

export class SettingEntity {
  group: string;
  key: string;
  value: unknown;
  updatedAt: Date;

  constructor(props: SettingEntityProps) {
    this.group = props.group;
    this.key = props.key;
    this.value = props.value;
    this.updatedAt = props.updatedAt || new Date();
  }
}
