import { Command, InteractionDataType, APIInteractionResponse, InteractionResponseType } from '@discordcf/framework'
import { Env } from '..'

export const helloCommand: Command<InteractionDataType.ChatInput> = [
  {
    name: 'hello',
    description: 'A simple hello message',
  },
  async (interaction: any, env: Env, context: any): Promise<APIInteractionResponse> => {
    const userId = interaction.member?.user.id

    return {
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: `Hello, <@${userId}>`,
        allowed_mentions: {
          users: [userId || ''],
        },
      },
    }
  },
]

export default helloCommand
