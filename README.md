# Cloudflare Workers Discord Bot

Build blazing fast Discord bots on top of Cloudflare Workers for free! :rocket:

## Introduction :pencil2:

This framework was inspired by and based on [@glenstack/cf-workers-discord-bot].
However, there are a few caveats in that implementation that makes it a bit difficult to work with:

- It's not actively maintained.
- The codebase is not that clear and maintainable in terms of packages.
- You cannot push application commands into a guild. You can only do that globally (Discord takes 1 hr. to update).
- You cannot set the bot permissions easily.

So `cloudflare-discord-bot` comes to solve all of them, as you will see in the following sections.

## Installation :electric_plug:

```bash
npm install --save cloudflare-discord-bot
```

## Usage :keyboard:

You will notice there are 3 environment variables you need to set up.
This is not required, but it's best not to hardcode values that might change at some point in time.
Those are `CLIENT_ID`, `CLIENT_SECRET`, and `PUBLIC_KEY`.
For that, in Cloudflare, you should set those up accordingly.

Addtionally, you can choose to deploy your commands on a given guild or globally.
The former will update your commands instantly on your server, which is great to develop your bot.
On the other hand, the latter will update your commands after 1 hr. 
This is a Discord limitation.
Generally, you will choose to do that when you are ready to go live.

Lastly, you can set the bot permissions by setting each permission you need.
Without worrying about the permission numbers Discord uses.

### `index.ts`

```typescript
import { helloHandler, helloCommand } from './hello';
import { 
    createApplicationCommandHandler,
    Permissions,
    PermissionType 
} from 'cloudflare-discord-bot';

declare const CLIENT_ID: string;
declare const CLIENT_SECRET: string;
declare const PUBLIC_KEY: string;

const applicationCommandHandler = createApplicationCommandHandler({
  applicationId: CLIENT_ID,
  applicationSecret: CLIENT_SECRET,
  publicKey: PUBLIC_KEY,
  commands: [
    [helloCommand, helloHandler],
  ],
  guildId: "INSERT YOUR GUILD ID",  // Should only be used for development workers.
  permissions: new Permissions(
    [
      PermissionType.ADD_REACTIONS,
      PermissionType.ATTACH_FILES,
      PermissionType.EMBED_LINKS,
      PermissionType.SEND_MESSAGES,
      PermissionType.USE_PUBLIC_THREADS,
      PermissionType.SEND_TTS_MESSAGES,
      PermissionType.MENTION_EVERYONE,
      PermissionType.USE_EXTERNAL_EMOJIS,
      PermissionType.USE_EXTERNAL_STICKERS,
    ]
  )
});

addEventListener('fetch', (event) => {
  event.respondWith(applicationCommandHandler(event.request))
})
```

### `hello.ts`

```typescript
import { 
  ApplicationCommand,
  InteractionHandler,
  Interaction,
  InteractionResponse,
  InteractionResponseType
} from 'cloudflare-discord-bot'

export const helloCommand: ApplicationCommand = {
  name: "hello",
  description: "Your bot will greet you!",
};

export const helloHandler: InteractionHandler = async (
  interaction: Interaction
): Promise<InteractionResponse> => {
  const userID = interaction.member.user.id;

  return {
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      content: `Hello, <@${userID}>!`,
      allowed_mentions: {
        users: [userID],
      },
    },
  };
};
```

## Example of bots

- [Mixurri: A chatbot to organize 5v5 matches.][Mixurri]

## Contributing :handshake:

Contribution is pretty simple.
There are many ways of contributing to it:

1. Use the module to build your own bots.
2. In Github Issues, report any defect or feature that it's not supported.
3. If there's an open issue, create a pull request with your solution.
4. Spread the word about this little library.

## License :scroll:

Licensed under the [Apache License 2.0].

[@glenstack/cf-workers-discord-bot]: https://github.com/glenstack/glenstack/tree/master/packages/cf-workers-discord-bot
[Apache License 2.0]: ./LICENSE
[Mixurri]: https://github.com/alvgaona/mixurri.git

