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
