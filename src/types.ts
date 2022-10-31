export * from "discord-api-types/v10";
export * from "discord-api-types/payloads";

import type { PermissionFlagsBits } from "discord-api-types/v10";
export type PermissionFlags = keyof typeof PermissionFlagsBits;

import type { APIApplicationCommand } from "discord-api-types/payloads";
export type PartialAPIApplicationCommand = Partial<APIApplicationCommand>;
