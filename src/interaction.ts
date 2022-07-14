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

export type InteractionResponse = Promise<APIInteractionResponse> | APIInteractionResponse;

export type CommandInteractionHandlerWithData<DataType extends InteractionDataType> = (
  interaction: InteractionDataLookup[DataType],
  ...extra: any
) => InteractionResponse;
export type CommandInteractionHandler = (interaction: CommandInteraction, ...extra: any) => InteractionResponse;
export type ComponentInteractionHandler = (interaction: Partial<ComponentInteraction>, ...extra: any) => InteractionResponse;

const validateRequest = async (request: Request, publicKey: string) => {
  const signature = request.headers.get("x-signature-ed25519");
  const timestamp = request.headers.get("x-signature-timestamp");

  if (signature === null || timestamp === null) return false;

  return nacl.sign.detached.verify(Buffer.from(timestamp + (await request.text())), Buffer.from(signature, "hex"), Buffer.from(publicKey, "hex"));
};

const jsonResponse = (data: any) =>
  new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });

type InteractionArgs = {
  publicKey: string;
  commands: DictCommands;
  components?: { [key: string]: ComponentInteractionHandler };
};
export const interaction =
  ({ publicKey, commands, components = {} }: InteractionArgs) =>
  async (request: Request, ...extra: any): Promise<Response> => {
    try {
      const requestValid = await validateRequest(request.clone(), publicKey);
      if (!requestValid) return new Response(null, { status: 401 });

      const interaction: APIInteraction = await request.json();

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
      if (handler! === undefined) return new Response(null, { status: 404 });
      return jsonResponse(await handler(interaction, ...extra));
    } catch (e: any) {
      console.error(e);
      return new Response(null, { status: 500 });
    }
  };
