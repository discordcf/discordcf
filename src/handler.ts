import { Router } from 'itty-router';
import { setup } from './setup';
import { authorize } from './authorize';
import { interaction } from './interaction';
import { Permissions } from './permissions';

import type { InteractionHandler } from './interaction';
import {
  APIButtonComponentWithCustomId,
  APISelectMenuComponent,
  PartialWithRequiredAPIApplicationCommand,
} from './types';

const router = Router();

export interface Command {
  command: PartialWithRequiredAPIApplicationCommand;
  handler: InteractionHandler;
}

export interface MessageComponent {
  component: MessageComponentWithCustomId;
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

export type MessageComponentWithCustomId = APIButtonComponentWithCustomId | APISelectMenuComponent;

export const fromHexString = (hexString: string): Uint8Array =>
  Uint8Array.from((hexString.match(/.{1,2}/g) ?? []).map((byte) => parseInt(byte, 16)));

export type ApplicationCommandHandler = (request: Request, ...extra: any) => Promise<any>;

const toDictComponents = (application: Application): DictComponents | undefined => {
  return application.components?.reduce<DictComponents>((result, c) => {
    result[c.component.custom_id] = { component: c.component, handler: c.handler };
    return result;
  }, {});
};

const toDictCommands = (application: Application): DictCommands => {
  return application.commands.reduce<DictCommands>((result, c) => {
    result[c.command.name] = { command: c.command, handler: c.handler };
    return result;
  }, {});
};

export const createApplicationCommandHandler = (
  application: Application,
  env: any,
  context: ExecutionContext,
): ApplicationCommandHandler => {
  const components = toDictComponents(application);
  const commands = toDictCommands(application);
  const publicKey = fromHexString(application.publicKey);

  router.get('/', authorize(application.applicationId, application.permissions));
  router.post(
    '/interaction',
    interaction({ applicationId: application.applicationId, publicKey, commands, components }, env, context),
  );
  router.get('/setup', setup(application));
  return router.handle;
};
