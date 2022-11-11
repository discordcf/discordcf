import helloCommand from './cmd/hello'
import { createApplicationCommandHandler, Permissions } from '@discordcf/framework'

let applicationCommandHandler: (request: Request) => any

export interface Env {
  APPLICATION_ID: string
  CLIENT_SECRET: string
  PUBLIC_KEY: string
  BOT_TOKEN: string
  GUILD_ID?: string
}

export default {
  fetch: async (request: Request, env: Env, context: any): Promise<Response> => {
    if (!applicationCommandHandler) {
      applicationCommandHandler = createApplicationCommandHandler({
        applicationId: env.APPLICATION_ID,
        publicKey: env.PUBLIC_KEY,
        botToken: env.BOT_TOKEN,
        commands: [helloCommand],
        components: {},
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
      })
    }
    return applicationCommandHandler(request)
  },
}
