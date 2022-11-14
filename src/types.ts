import type { APIApplicationCommand } from 'discord-api-types/payloads';
import type { PermissionFlagsBits } from 'discord-api-types/v10';

export * from 'discord-api-types/v10';
export * from 'discord-api-types/payloads';
export type PermissionFlags = keyof typeof PermissionFlagsBits;

type PartialWithRequired<T, K extends keyof T> = Pick<T, K> & Partial<T>;

export type PartialWithRequiredAPIApplicationCommand = PartialWithRequired<APIApplicationCommand, 'name'>;
