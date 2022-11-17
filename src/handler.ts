import { Router } from 'itty-router';
import { setup } from './setup';
import { authorize } from './authorize';
import { interaction } from './interaction';
import { Permissions } from './permissions';

import type { InteractionHandler } from './interaction';
import type { APIMessageComponent, PartialWithRequiredAPIApplicationCommand } from './types';

const router = Router();

export interface Command {
  command: PartialWithRequiredAPIApplicationCommand;
  handler: InteractionHandler;
}

export interface MessageComponent {
  customId: string;
  component: APIMessageComponent;
  handler: InteractionHandler;
}

export interface Application {
  applicationId: string;
  botToken: string;
  publicKey: string;
  guildId?: string;
  commands: Command[];
  components?: MessageComponent[];
  permissions: Permissions;
}

export type DictComponents = Record<string, MessageComponent>;

export type DictCommands = Record<string, Command>;

export const fromHexString = (hexString: string): Uint8Array =>
  Uint8Array.from((hexString.match(/.{1,2}/g) ?? []).map((byte) => parseInt(byte, 16)));

export type ApplicationCommandHandler = (request: Request, ...extra: any) => Promise<any>;

export const createApplicationCommandHandler = (
  application: Application,
  env: any,
  context: ExecutionContext,
): ApplicationCommandHandler => {
  router.get('/', authorize(application.applicationId, application.permissions));

  const commands = application.commands.reduce<DictCommands>((result, c) => {
    result[c.command.name] = { command: c.command, handler: c.handler };
    return result;
  }, {});

  const components = application.components?.reduce<DictComponents>((result, c) => {
    result[c.customId] = { customId: c.customId, component: c.component, handler: c.handler };
    return result;
  }, {});

  const publicKey = fromHexString(application.publicKey);

  router.post(
    '/interaction',
    interaction({ applicationId: application.applicationId, publicKey, commands, components }, env, context),
  );
  router.get('/setup', setup(application));
  return router.handle;
};
