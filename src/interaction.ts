import nacl from "tweetnacl";
import { Buffer } from "buffer";
import { ApplicationCommand, InteractionHandler, Interaction, InteractionType, InteractionResponseType } from "./types";
import type { DictCommands } from "./handler";

const makeValidator =
  ({ publicKey }: { publicKey: string }) =>
  async (request: Request) => {
    const headers = Object.fromEntries(request.headers);
    const signature = String(headers["x-signature-ed25519"]);
    const timestamp = String(headers["x-signature-timestamp"]);
    const body = await request.json();

    const isValid = nacl.sign.detached.verify(Buffer.from(timestamp + JSON.stringify(body)), Buffer.from(signature, "hex"), Buffer.from(publicKey, "hex"));

    if (!isValid) throw new Error("Invalid request");
  };

const jsonResponse = (data: any) =>
  new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });

export const interaction = ({
  publicKey,
  commands,
  components = {},
}: {
  publicKey: string;
  commands: DictCommands;
  components?: { [key: string]: InteractionHandler };
}) => {
  return async (request: Request, ...extra: any): Promise<Response> => {
    const validateRequest = makeValidator({ publicKey });

    try {
      await validateRequest(request.clone());
      try {
        const interaction = (await request.json()) as Interaction;

        let handler: InteractionHandler;

        switch (interaction.type) {
          case InteractionType.Ping: {
            return jsonResponse({ type: 1 });
          }
          case InteractionType.ApplicationCommand: {
            if (interaction.data?.name === undefined) break;
            handler = commands[interaction.data.name].handler;
            break;
          }
          case InteractionType.MessageComponent: {
            if (interaction.data?.custom_id === undefined) break;
            handler = components[interaction.data.custom_id];
            break;
          }
        }
        if (handler! === undefined) return new Response(null, { status: 500 });
        return jsonResponse(await handler(interaction, ...extra));
      } catch (e: any) {
        console.log(e.message);
        return new Response(null, { status: 400 });
      }
    } catch (e: any) {
      console.error(e.message);
      return new Response(null, { status: 401 });
    }
    return new Response(null, { status: 500 });
  };
};
