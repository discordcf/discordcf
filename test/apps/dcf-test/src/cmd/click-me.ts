import { Command, InteractionResponseType, Context, APIInteractionResponse } from '@discordcf/framework';
import clickMePrimaryComponent from '../components/click-me-primary';

export const clickMeCommand: Command = {
  command: {
    name: 'clickme',
    description: 'Click the button a button to greet you',
  },
  handler: async (ctx: Context): Promise<APIInteractionResponse> => {
    const userId = ctx.interaction.structure.member?.user.id;
    return {
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: `<@${userId}>, click me and see what happens!`,
        components: [
          {
            type: 1,
            components: [clickMePrimaryComponent.component],
          },
        ],
        allowed_mentions: {
          users: [userId || ''],
        },
      },
    };
  },
};

export default clickMeCommand;
