import { APIInteractionResponse, Context, InteractionResponseType, MessageComponent } from '@discordcf/framework';

const clickMePrimaryComponent: MessageComponent = {
  component: {
    type: 2,
    label: 'Primary',
    style: 1,
    custom_id: 'primary',
  },
  handler: async (ctx: Context): Promise<APIInteractionResponse> => {
    ctx.defer(async (ctx: Context): Promise<void> => {
      await ctx.followup.reply({ content: 'And this is a deferred hello!' });
    });
    return {
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: 'Hello from component handler.',
      },
    };
  },
};

export default clickMePrimaryComponent;
