import { PermissionFlagsBits } from "discord-api-types/payloads";

export type PermissionFlags = keyof typeof PermissionFlagsBits;
export class Permissions {
  constructor(private types: PermissionFlags[]) {}

  compute() {
    let permission = 0n;
    this.types.forEach((type) => (permission += PermissionFlagsBits[type]));
    return String(permission);
  }
}
