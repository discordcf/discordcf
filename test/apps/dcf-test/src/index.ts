import helloCommand from './cmd/hello';
import { createApplicationCommandHandler, Permissions } from '@discordcf/framework';
import deferredCommand from './cmd/deferred';

let applicationCommandHandler: (request: Request) => Promise<any>;

export interface Env {
  APPLICATION_ID: string;
  CLIENT_SECRET: string;
  PUBLIC_KEY: string;
  BOT_TOKEN: string;
  GUILD_ID?: string;
}

export default {
  fetch: async (request: Request, env: Env, context: ExecutionContext): Promise<Response> => {
    if (!applicationCommandHandler) {
      applicationCommandHandler = createApplicationCommandHandler(
        {
          applicationId: env.APPLICATION_ID,
          publicKey: env.PUBLIC_KEY,
          botToken: env.BOT_TOKEN,
          commands: [helloCommand, deferredCommand],
          components: [],
          guildId: env.GUILD_ID,
          permissions: new Permissions([
            'AddReactions',
            'AttachFiles',
            'EmbedLinks',
            'SendMessages',
            'SendTTSMessages',
            'MentionEveryone',
            'UseExternalEmojis',
            'UseExternalStickers',
          ]),
        },
        env,
        context,
      );
    }
    return applicationCommandHandler(request);
  },
};
