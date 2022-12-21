import helloCommand from './cmd/hello';
import { createApplicationCommandHandler, Permissions } from '@discordcf/framework';
import deferredCommand from './cmd/deferred';
import clickMePrimaryComponent from './components/click-me-primary';
import clickMeCommand from './cmd/click-me';
import embedCommand from './cmd/embed';

let applicationCommandHandler: (request: Request) => Promise<Response>;

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
          commands: [helloCommand, deferredCommand, clickMeCommand, embedCommand],
          components: [clickMePrimaryComponent],
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
