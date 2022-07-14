import nacl from "tweetnacl";
import { Buffer } from "buffer";

import type { DictCommands } from "./handler";
import {
	APIMessageComponentInteraction as ComponentInteraction,
	APIApplicationCommandInteraction as CommandInteraction,
	APIApplicationCommandInteractionWrapper as CommandInteractionWithData,
	APIInteractionResponse,
	APIInteraction,
	InteractionType,
	APIChatInputApplicationCommandInteractionData as ChatInputData,
	APIContextMenuInteractionData as MenuInteractionData,
} from "discord-api-types/payloads";

export enum InteractionDataType {
	// APIChatInputApplicationCommandInteractionData
	ChatInput,
	// APIContextMenuInteractionData
	ContextMenu,
}

type InteractionDataLookup = {
	[InteractionDataType.ChatInput]: CommandInteractionWithData<ChatInputData>;
	[InteractionDataType.ContextMenu]: CommandInteractionWithData<MenuInteractionData>;
};

type InteractionResponse = Promise<APIInteractionResponse> | APIInteractionResponse;

export type CommandInteractionHandlerWithData<DataType extends InteractionDataType> = (
	interaction: InteractionDataLookup[DataType],
	...extra: any
) => InteractionResponse;
export type CommandInteractionHandler = (interaction: CommandInteraction, ...extra: any) => InteractionResponse;
export type ComponentInteractionHandler = (interaction: Partial<ComponentInteraction>, ...extra: any) => InteractionResponse;

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
	components?: { [key: string]: ComponentInteractionHandler };
}) => {
  return async (request: Request, ...extra: any): Promise<Response> => {
    const validateRequest = makeValidator({ publicKey });

		try {
			await validateRequest(request.clone());
			try {
				const interaction = (await request.json()) as APIInteraction;

				let handler: (...args: any[]) => InteractionResponse;

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
