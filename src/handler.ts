import { Router } from 'itty-router';
import { setup } from './setup';
import { authorize } from './authorize';
import { interaction } from './interaction';
import { Permissions } from './permissions';

import type { InteractionHandler } from './interaction';
import type { PartialWithRequiredAPIApplicationCommand } from './types';

const router = Router();

export type Command = [PartialWithRequiredAPIApplicationCommand, InteractionHandler];

export interface Application {
  applicationId: string;
  botToken: string;
  publicKey: string;
  guildId?: string;
  commands: Command[];
  components?: Record<string, InteractionHandler>;
  permissions: Permissions;
}

export type DictCommands = Record<
  string,
  {
    command: PartialWithRequiredAPIApplicationCommand;
    handler: InteractionHandler;
  }
>;

export const fromHexString = (hexString: string): Uint8Array =>
  Uint8Array.from((hexString.match(/.{1,2}/g) ?? []).map((byte) => parseInt(byte, 16)));

export type ApplicationCommandHandler = (request: Request, ...extra: any) => Promise<any>;

export const createApplicationCommandHandler = (
  application: Application,
  env: any,
  context: any,
): ApplicationCommandHandler => {
  router.get('/', authorize(application.applicationId, application.permissions));

  const commands = application.commands.reduce<DictCommands>((_commands, command) => {
    _commands[command[0].name] = { command: command[0], handler: command[1] };
    return _commands;
  }, {});

  const publicKey = fromHexString(application.publicKey);

  router.post(
    '/interaction',
    interaction(
      { applicationId: application.applicationId, publicKey, commands, components: application.components },
      env,
      context,
    ),
  );
  router.get('/setup', setup(application));
  return router.handle;
};
