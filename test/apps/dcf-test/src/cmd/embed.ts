import { Command, InteractionResponseType, Context, APIInteractionResponse } from '@discordcf/framework';

export const embedCommand: Command = {
  command: {
    name: 'embed',
    description: 'A sample embed message',
  },
  handler: async (ctx: Context): Promise<APIInteractionResponse> => {
    // ctx will remain unused
    return {
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: 'Some embed',
        embeds: [
          {
            color: 0x0099ff,
            title: 'Some title',
            description: 'Some description',
            url: 'https://github.com/discordcf/discordcf',
            author: {
              name: 'Some name',
              icon_url: 'https://pub-f074cead5eaf408790b463b05f6e8b32.r2.dev/discordcf/logo.png',
              url: 'https://github.com/discordcf/discordcf',
            },
            thumbnail: {
              url: 'https://pub-f074cead5eaf408790b463b05f6e8b32.r2.dev/discordcf/logo.png',
            },
            fields: [
              {
                name: 'Regular field title',
                value: 'Some value',
              },
              {
                name: '\u200B',
                value: '\u200B',
              },
              {
                name: 'Inline field title',
                value: 'Some value',
                inline: true,
              },
              {
                name: 'Inline field title',
                value: 'Some value',
                inline: true,
              },
            ],
            footer: {
              text: 'Some footer text',
              icon_url: 'https://pub-f074cead5eaf408790b463b05f6e8b32.r2.dev/discordcf/logo.png',
            },
          },
        ],
      },
    };
  },
};

export default embedCommand;
