import { sign } from 'tweetnacl';
import { Context } from './context';
import { DictCommands, fromHexString } from './handler';
import {
  APIInteractionResponse,
  APIInteraction,
  APIContextMenuInteractionData,
  APIApplicationCommandInteractionData,
  APIUserApplicationCommandInteractionData,
  APIMessageApplicationCommandInteractionData,
  APIMessageComponentInteractionData,
  APIMessageButtonInteractionData,
  APIMessageRoleSelectInteractionData,
  APIMessageUserSelectInteractionData,
  APIModalSubmission,
  InteractionType,
} from './types';

export type InteractionResponse = Promise<APIInteractionResponse> | APIInteractionResponse;

export type InteractionHandler = (ctx: Context, ...extra: any) => Promise<APIInteractionResponse>;

class InvalidRequestError extends Error {
  constructor(message: string) {
    super(message);
  }
}

const validateRequest = async (request: Request, publicKey: Uint8Array): Promise<void> => {
  const signature = request.headers.get('x-signature-ed25519');
  const timestamp = request.headers.get('x-signature-timestamp');

  if (signature === null || timestamp === null) {
    console.error(`Signature and/or timestamp are invalid: ${signature}, ${timestamp}`);
    throw new InvalidRequestError(`Request signature is ${signature} and timestamp is ${timestamp}`);
  }

  const encoder = new TextEncoder();

  const isValid = sign.detached.verify(
    encoder.encode(timestamp + (await request.text())),
    fromHexString(signature),
    publicKey,
  );

  if (!isValid) {
    throw new InvalidRequestError("Request didn't comply with the correct signature.");
  }
};

const jsonResponse = (data: any): Response => {
  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
};

interface InteractionArgs {
  applicationId: string;
  publicKey: Uint8Array;
  commands: DictCommands;
  components?: { [key: string]: InteractionHandler };
}

type APIApplicationInteractionData =
  | APIApplicationCommandInteractionData
  | APIUserApplicationCommandInteractionData
  | APIApplicationCommandInteractionData
  | APIMessageApplicationCommandInteractionData
  | APIContextMenuInteractionData
  | APIMessageButtonInteractionData
  | APIMessageComponentInteractionData
  | APIMessageRoleSelectInteractionData
  | APIMessageUserSelectInteractionData
  | APIModalSubmission
  | undefined;

export class Interaction {
  constructor(private readonly _interaction: APIInteraction, private readonly applicationId: string) {}

  get type(): InteractionType {
    return this._interaction.type;
  }

  get data(): APIApplicationInteractionData {
    return this._interaction.data;
  }

  get interaction(): APIInteraction {
    return this._interaction;
  }
}

export const interaction =
  ({ applicationId, publicKey, commands, components = {} }: InteractionArgs, env?: any, context?: any) =>
  async (request: Request, ...extra: any): Promise<Response> => {
    try {
      await validateRequest(request.clone(), publicKey);

      const ctx = new Context(env, context, new Interaction(await request.json(), applicationId));

      switch (ctx.interaction.type) {
        case InteractionType.Ping: {
          return jsonResponse({ type: 1 });
        }
        case InteractionType.ApplicationCommand: {
          if (ctx.interaction.data?.name === undefined) {
            throw Error('Interaction name is undefined');
          }
          const handler = commands[ctx.interaction.data?.name].handler;
          return jsonResponse(await handler(ctx, ...extra));
        }
        case InteractionType.MessageComponent: {
          if (ctx.interaction.data === undefined) {
            throw Error('Interaction custom_id is undefined');
          }
          const handler = components[ctx.interaction.data?.custom_id];
          return jsonResponse(await handler(ctx, ...extra));
        }
        default: {
          return new Response(null, { status: 404 });
        }
      }
    } catch (e: any) {
      console.error(e);
      if (e instanceof InvalidRequestError) {
        return new Response(e.message, { status: 401 });
      }
      return new Response('Internal server error!', { status: 500 });
    }
  };
