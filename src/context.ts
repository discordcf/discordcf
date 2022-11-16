import { APIInteraction, APIInteractionResponse, RESTPostAPIInteractionFollowupJSONBody } from 'discord-api-types/v10';
import { Interaction } from './interaction';
import { createFollowUpMessage, createInteractionResponse } from './interactions';

class FollowUp {
  constructor(private readonly interaction: APIInteraction, private readonly context: any) {}

  async reply(message: RESTPostAPIInteractionFollowupJSONBody): Promise<void> {
    await createFollowUpMessage(this.interaction, message);
  }
}

export class Context {
  private readonly _followup: FollowUp;

  constructor(private readonly _env: any, private readonly _context: any, private readonly _interaction: Interaction) {
    this._followup = new FollowUp(this._interaction.interaction, _context);
  }

  get env(): any {
    return this._env;
  }

  get context(): any {
    return this._context;
  }

  get interaction(): APIInteraction {
    return this._interaction.interaction;
  }

  get followup(): FollowUp {
    return this._followup;
  }

  async reply(message: APIInteractionResponse): Promise<Response> {
    return await createInteractionResponse(this._interaction.interaction, message);
  }

  async defer(callback: (...args: any) => Promise<any>): Promise<void> {
    this.context.waitUntil(await callback);
  }
}
