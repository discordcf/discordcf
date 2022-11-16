import { Command, InteractionResponseType, MessageFlags, Context, APIInteractionResponse } from '@discordcf/framework';

export const deferredCommand: Command = [
  {
    name: 'deferred',
    description: 'A deferred message',
  },
  async (ctx: Context): Promise<APIInteractionResponse> => {
    // await ctx.defer(async () => {
    //   await ctx.followup.reply({
    //     content: "The message has been deferred"
    //   })
    // })
    ctx.context.waitUntil(
      new Promise(() => {
        return { content: 'HAHA' };
      }),
    );

    return {
      type: InteractionResponseType.DeferredChannelMessageWithSource,
      data: {
        flags: MessageFlags.Ephemeral,
      },
    };
  },
];

export default deferredCommand;
