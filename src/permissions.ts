import { PermissionType } from "./types";

export class Permissions {
  constructor(private types: PermissionType[]) {}

  compute() {
    let permission = 0;
    this.types.forEach((type) => (permission += type));
    return String(permission);
  }
}
