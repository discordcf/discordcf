import { sign } from "tweetnacl"
import { DictCommands, fromHexString } from "./handler"
import type {
  APIMessageComponentInteraction,
  APIApplicationCommandInteraction,
  APIApplicationCommandInteractionWrapper,
  APIInteractionResponse,
  APIInteraction,
  APIChatInputApplicationCommandInteractionData,
  APIContextMenuInteractionData,
} from "./types"

import { InteractionType } from './types'

export enum InteractionDataType {
  // APIChatInputApplicationCommandInteractionData
  ChatInput,
  // APIContextMenuInteractionData
  ContextMenu,
}

type InteractionDataLookup = {
  [InteractionDataType.ChatInput]: APIApplicationCommandInteractionWrapper<APIChatInputApplicationCommandInteractionData>;
  [InteractionDataType.ContextMenu]: APIApplicationCommandInteractionWrapper<APIContextMenuInteractionData>;
};

export type InteractionResponse = Promise<APIInteractionResponse> | APIInteractionResponse;

export type CommandInteractionHandlerWithData<DataType extends InteractionDataType> = (
  interaction: InteractionDataLookup[DataType],
  ...extra: any
) => InteractionResponse;

export type CommandInteractionHandler = (interaction: APIApplicationCommandInteraction, ...extra: any) => InteractionResponse;

export type ComponentInteractionHandler = (interaction: Partial<APIMessageComponentInteraction>, ...extra: any) => InteractionResponse;

class InvalidRequestError extends Error {
  constructor(message: string) {
    super(message);
  }
}

const validateRequest = async (request: Request, publicKey: Uint8Array): Promise<void> => {
  const signature = request.headers.get("x-signature-ed25519");
  const timestamp = request.headers.get("x-signature-timestamp");

  if (signature === null || timestamp === null) {
    console.error(`Signature and/or timestamp are invalid: ${signature}, ${timestamp}`)
    throw new InvalidRequestError(`Request signature is ${signature} and timestamp is ${timestamp}`)
  }

  const encoder = new TextEncoder();

  const isValid = sign.detached.verify(encoder.encode(timestamp + (await request.text())), fromHexString(signature), publicKey);

  if (!isValid) {
    throw new InvalidRequestError("Request didn't comply with the correct signature.");
  }
};

const jsonResponse = (data: any): Response => {
  return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });
}

type InteractionArgs = {
  publicKey: Uint8Array;
  commands: DictCommands;
  components?: { [key: string]: ComponentInteractionHandler };
};

export const interaction = ({ publicKey, commands, components = {} }: InteractionArgs) =>
  async (request: Request, ...extra: any): Promise<Response> => {
    try {
      await validateRequest(request.clone(), publicKey);

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
      if (e instanceof InvalidRequestError) {
        return new Response(e.message, { status: 401});
      }
      return new Response("Internal server error!", { status: 500 });
    }
  };
