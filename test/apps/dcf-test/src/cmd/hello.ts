import { Command, InteractionResponseType, Context, APIInteractionResponse } from '@discordcf/framework';

export const helloCommand: Command = [
  {
    name: 'hello',
    description: 'A simple hello message',
  },
  async (ctx: Context): Promise<APIInteractionResponse> => {
    const userId = ctx.interaction.member?.user.id;
    return {
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: `Hello, <@${userId}>`,
        allowed_mentions: {
          users: [userId || ''],
        },
      },
    };
  },
];

export default helloCommand;
