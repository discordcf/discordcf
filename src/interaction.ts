import { sign } from 'tweetnacl';
import { Context } from './context';
import { DictCommands, DictComponents, fromHexString } from './handler';
import {
  createInteractionResponse,
  deleteOriginalInteractionResponse,
  editOriginalInteractionResponse,
  getOriginalInteractionResponse,
} from './api/interactions';
import {
  APIInteractionResponse,
  APIInteraction,
  InteractionType,
  APIApplicationCommandInteraction,
  APIMessageComponentInteraction,
  RESTPatchAPIInteractionOriginalResponseJSONBody,
} from './types';

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
  components?: DictComponents;
}

export class Interaction {
  constructor(private readonly _interaction: APIInteraction, private readonly applicationId: string) {}

  get type(): InteractionType {
    return this._interaction.type;
  }

  get structure(): APIInteraction {
    return this._interaction;
  }

  async reply(message: APIInteractionResponse): Promise<Response> {
    return await createInteractionResponse(this._interaction, message);
  }

  async get(): Promise<Response> {
    return await getOriginalInteractionResponse(this._interaction);
  }

  async edit(message: RESTPatchAPIInteractionOriginalResponseJSONBody): Promise<Response> {
    return await editOriginalInteractionResponse(this._interaction, message);
  }

  async delete(): Promise<Response> {
    return await deleteOriginalInteractionResponse(this._interaction);
  }
}

export const interaction =
  ({ applicationId, publicKey, commands, components = {} }: InteractionArgs, env: any, context: ExecutionContext) =>
  async (request: Request, ...extra: any): Promise<Response> => {
    try {
      await validateRequest(request.clone(), publicKey);

      const ctx = new Context(env, context, new Interaction(await request.json(), applicationId));

      switch (ctx.interaction.type) {
        case InteractionType.Ping: {
          return jsonResponse({ type: 1 });
        }
        case InteractionType.ApplicationCommand: {
          const structure = ctx.interaction.structure as APIApplicationCommandInteraction;
          if (structure.data?.name === undefined) {
            throw Error('Interaction name is undefined');
          }
          const handler = commands[structure.data?.name].handler;
          return jsonResponse(await handler(ctx, ...extra));
        }
        case InteractionType.MessageComponent: {
          const structure = ctx.interaction.structure as APIMessageComponentInteraction;
          if (structure.data === undefined) {
            throw Error('Interaction custom_id is undefined');
          }
          const handler = components[structure.data?.custom_id].handler;
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
