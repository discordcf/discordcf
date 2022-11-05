import { Router } from "itty-router";
import { setup } from "./setup";
import { authorize } from "./authorize";
import { CommandInteractionHandlerWithData, interaction, InteractionDataType } from "./interaction";
import { Permissions } from "./permissions";

import type { CommandInteractionHandler, ComponentInteractionHandler } from "./interaction";
import type { PartialAPIApplicationCommand } from "./types";

const router = Router();

export type Command<DataType extends InteractionDataType | void = void> = [
  PartialAPIApplicationCommand,
  DataType extends InteractionDataType ? CommandInteractionHandlerWithData<DataType> : CommandInteractionHandler
];

export type Application = {
  applicationId: string;
  botToken: string;
  publicKey: string;
  guildId?: string;
  commands: Command<any>[];
  components?: Record<string, ComponentInteractionHandler>;
  permissions: Permissions;
};

export type DictCommands = Record<
  string,
  {
    command: PartialAPIApplicationCommand;
    handler: CommandInteractionHandler;
  }
>;

export const fromHexString = (hexString: string) => Uint8Array.from((hexString.match(/.{1,2}/g) || []).map((byte) => parseInt(byte, 16)));

export type ApplicationCommandHandler = (request: Request, ...extra: any) => Promise<any>;

export const createApplicationCommandHandler = (application: Application): ApplicationCommandHandler => {
  router.get("/", authorize(application.applicationId, application.permissions));
  const commands = application.commands.reduce((_commands, command) => {
    _commands[command[0].name!] = { command: command[0], handler: command[1] };
    return _commands;
  }, <DictCommands>{});

  const publicKey = fromHexString(application.publicKey);

  router.post("/interaction", interaction({ publicKey, commands, components: application.components }));
  router.get("/setup", setup(application));
  return router.handle;
};
