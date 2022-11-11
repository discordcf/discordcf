import { sign } from 'tweetnacl'
import { DictCommands, fromHexString } from './handler'
import type {
  APIMessageComponentInteraction,
  APIApplicationCommandInteraction,
  APIApplicationCommandInteractionWrapper,
  APIInteractionResponse,
  APIInteraction,
  APIChatInputApplicationCommandInteractionData,
  APIContextMenuInteractionData,
} from './types'

import { InteractionType } from './types'

export enum InteractionDataType {
  // APIChatInputApplicationCommandInteractionData
  ChatInput,
  // APIContextMenuInteractionData
  ContextMenu,
}

interface InteractionDataLookup {
  [InteractionDataType.ChatInput]: APIApplicationCommandInteractionWrapper<APIChatInputApplicationCommandInteractionData>
  [InteractionDataType.ContextMenu]: APIApplicationCommandInteractionWrapper<APIContextMenuInteractionData>
}

export type InteractionResponse = Promise<APIInteractionResponse> | APIInteractionResponse

export type CommandInteractionHandlerWithData<DataType extends InteractionDataType> = (
  interaction: InteractionDataLookup[DataType],
  ...extra: any
) => InteractionResponse

export type CommandInteractionHandler = (
  interaction: APIApplicationCommandInteraction,
  ...extra: any
) => InteractionResponse

export type ComponentInteractionHandler = (
  interaction: Partial<APIMessageComponentInteraction>,
  ...extra: any
) => InteractionResponse

class InvalidRequestError extends Error {
  constructor(message: string) {
    super(message)
  }
}

const validateRequest = async (request: Request, publicKey: Uint8Array): Promise<void> => {
  const signature = request.headers.get('x-signature-ed25519')
  const timestamp = request.headers.get('x-signature-timestamp')

  if (signature === null || timestamp === null) {
    console.error(`Signature and/or timestamp are invalid: ${signature}, ${timestamp}`)
    throw new InvalidRequestError(`Request signature is ${signature} and timestamp is ${timestamp}`)
  }

  const encoder = new TextEncoder()

  const isValid = sign.detached.verify(
    encoder.encode(timestamp + (await request.text())),
    fromHexString(signature),
    publicKey,
  )

  if (!isValid) {
    throw new InvalidRequestError("Request didn't comply with the correct signature.")
  }
}

const jsonResponse = (data: any): Response => {
  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } })
}

interface InteractionArgs {
  publicKey: Uint8Array
  commands: DictCommands
  components?: { [key: string]: ComponentInteractionHandler }
}

export const interaction =
  ({ publicKey, commands, components = {} }: InteractionArgs) =>
  async (request: Request, ...extra: any): Promise<Response> => {
    try {
      await validateRequest(request.clone(), publicKey)

      const interaction: APIInteraction = await request.json()

      switch (interaction.type) {
        case InteractionType.Ping: {
          return jsonResponse({ type: 1 })
        }
        case InteractionType.ApplicationCommand: {
          if (interaction.data?.name === undefined) {
            throw Error('Interaction name is undefined')
          }
          const handler = commands[interaction.data.name].handler
          return jsonResponse(await handler(interaction, ...extra))
        }
        case InteractionType.MessageComponent: {
          if (interaction.data?.custom_id === undefined) {
            throw Error('Interaction custom_id is undefined')
          }
          const handler = components[interaction.data.custom_id]
          return jsonResponse(await handler(interaction, ...extra))
        }
        default: {
          return new Response(null, { status: 404 })
        }
      }
    } catch (e: any) {
      console.error(e)
      if (e instanceof InvalidRequestError) {
        return new Response(e.message, { status: 401 })
      }
      return new Response('Internal server error!', { status: 500 })
    }
  }
