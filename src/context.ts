import {
  APIInteraction,
  RESTPatchAPIInteractionFollowupJSONBody,
  RESTPostAPIInteractionFollowupJSONBody,
} from 'discord-api-types/v10';
import { Interaction } from './interaction';
import { createFollowUpMessage, editFollowUpMessage, getFollowUpMessage } from './api/interactions';

class FollowUp {
  constructor(private readonly interaction: APIInteraction, private readonly context: any) {}

  async reply(message: RESTPostAPIInteractionFollowupJSONBody): Promise<Response> {
    return await createFollowUpMessage(this.interaction, message);
  }

  async get(messageId: string): Promise<Response> {
    return await getFollowUpMessage(this.interaction, messageId);
  }

  async edit(message: RESTPatchAPIInteractionFollowupJSONBody, messageId: string): Promise<Response> {
    return await editFollowUpMessage(this.interaction, message, messageId);
  }
}

export class Context {
  private readonly _followup: FollowUp;

  constructor(
    private readonly _env: any,
    private readonly _context: ExecutionContext,
    private readonly _interaction: Interaction,
  ) {
    this._followup = new FollowUp(this._interaction.structure, _context);
  }

  get env(): any {
    return this._env;
  }

  get context(): ExecutionContext {
    return this._context;
  }

  get interaction(): Interaction {
    return this._interaction;
  }

  get followup(): FollowUp {
    return this._followup;
  }

  defer(callback: (...args: any) => Promise<any>): void {
    // eslint-disable-next-line n/no-callback-literal
    this.context.waitUntil(callback(this));
  }
}
