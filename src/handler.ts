import { Router } from "itty-router";
import { setup } from "./setup";
import { authorize } from "./authorize";
import { interaction } from "./interaction";
import { Permissions } from "./permissions";
import { ApplicationCommand, InteractionHandler } from "./types";

const router = Router();

export type Application = {
  applicationId: string;
  applicationSecret: string;
  publicKey: string;
  guildId?: string;
  commands: [ApplicationCommand, InteractionHandler][];
  components?: { [key: string]: InteractionHandler };
  permissions: Permissions;
};

export type DictCommands = Record<
  string,
  {
    command: ApplicationCommand;
    handler: InteractionHandler;
  }
>;

export const createApplicationCommandHandler = (application: Application) => {
  router.get("/", authorize(application.applicationId, application.permissions));
  const commands = application.commands.reduce((_commands, command) => {
    _commands[command[0].name] = { command: command[0], handler: command[1] };
    return _commands;
  }, <DictCommands>{});
  router.post("/interaction", interaction({ publicKey: application.publicKey, commands, components: application.components }));
  router.get("/setup", setup(application));
  return router.handle;
};
