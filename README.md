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

You also need [**@cloudflare/wrangler2**](https://github.com/cloudflare/wrangler2) for publishing your worker etc. This does not cover wrangler commands.

## Usage :keyboard:

- Firstly you need a discord Application & Bot! Head over to https://discord.com/developers/applications and create a new application. This is where your `applicationId` and `publicKey` are.
- Go to **Bot** and create a new bot for your application. This is where your `botToken` is, to get it you need to click the **Reset Token** button.
- Create a new cloudflare worker using `wrangler init` and add your bots `applicationId`, `publicKey`, and `botToken` to it as secrets `wrangler secret` (or any method you prefer, we suggest using secrets).
- Write some cool code, or use some from our examples and publish your worker.
- By now you should have a functioning worker, you need to take your workers url and set your applications `Interactions Endpoint Url` in the discord developer portal for example: `https://cfdiscord-example.yourcloudflareuser.workers.dev/interaction`. You can find your workers url on your cloudflare workers dashboard.
- Aaaand your done! You should have a fully functional bot.

<br/>

You can choose to deploy your commands on a given guild or globally.

The former will update your commands instantly on your server, which is great to develop your bot.
On the other hand, the latter will update your commands after 1 hr.

This is a Discord limitation.
Generally, you will choose to do that when you are ready to go live.

## Simple Example

See `examples/hello` for more.

### `index.ts`

```ts
import { createApplicationCommandHandler, Permissions, type ApplicationCommandHandler } from "cloudflare-discord-bot";
import { hug } from "./hug";

export type EnvInterface = {
  // Secrets
  applicationId: string;
  botToken: string;
  publicKey: string;
};

let handler: ApplicationCommandHandler;
export default {
  fetch: (req: Request, env: EnvInterface, context: ExecutionContext) => {
    if (handler === undefined) {
      handler = createApplicationCommandHandler({
        applicationId: env.applicationId,
        botToken: env.botToken,
        publicKey: env.publicKey,
        // Optional guildId for development
        // guildId: "",
        commands: [hug],
        permissions: new Permissions([]),
      });
    }
    return handler(req, env, context);
  },
};
```

### `hug.ts`

```ts
import { Command, InteractionDataType, InteractionResponseType } from "cloudflare-discord-bot";

export const hug: Command<InteractionDataType.ChatInput> = [
  {
    name: "hello",
    description: "Ask your bot for a friendly hug!",
  },
  async (interaction) => {
    const userId = interaction?.member?.user.id;
    if (userId === undefined) throw new Error(`User is undefined`);

    return {
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: `Hello, <@${userId}>! *hugs*`,
        allowed_mentions: {
          users: [userId],
        },
      },
    };
  },
];
```

## Example of bots

- [Mixurri: A chatbot to organize 5v5 matches.][mixurri]

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
[apache license 2.0]: ./LICENSE
[mixurri]: https://github.com/alvgaona/mixurri.git
