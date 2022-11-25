import { Command, InteractionResponseType, MessageFlags, Context, APIInteractionResponse } from '@discordcf/framework';

export const deferredCommand: Command = {
  command: {
    name: 'deferred',
    description: 'A deferred message',
  },
  handler: async (ctx: Context): Promise<APIInteractionResponse> => {
    ctx.defer(async (ctx: Context): Promise<void> => {
      await ctx.followup.reply({ content: 'Message was deferred' });
      await ctx.followup.reply({ content: 'This is a follow up message' });
    });

    return {
      type: InteractionResponseType.DeferredChannelMessageWithSource,
      data: {
        flags: MessageFlags.Ephemeral,
      },
    };
  },
};

export default deferredCommand;
