import {
  APIInteraction,
  APIInteractionResponse,
  RESTPatchAPIInteractionFollowupJSONBody,
  RESTPatchAPIInteractionOriginalResponseJSONBody,
  RESTPostAPIInteractionFollowupJSONBody,
  RouteBases,
  Routes,
} from 'discord-api-types/v10';

export const createInteractionResponse = async (
  interaction: APIInteraction,
  message: APIInteractionResponse,
): Promise<Response> => {
  return await fetch(`${RouteBases.api}${Routes.interactionCallback(interaction.id, interaction.token)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  });
};

export const getOriginalInteractionResponse = async (interaction: APIInteraction): Promise<Response> => {
  return await fetch(
    `${RouteBases.api}${Routes.webhookMessage(interaction.application_id, interaction.token, 'original')}`,
    {
      method: 'GET',
      headers: { Accept: 'application/json' },
    },
  );
};

export const editOriginalInteractionResponse = async (
  interaction: APIInteraction,
  message: RESTPatchAPIInteractionOriginalResponseJSONBody,
): Promise<Response> => {
  return await fetch(
    `${RouteBases.api}${Routes.webhookMessage(interaction.application_id, interaction.token, 'original')}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    },
  );
};

export const deleteOriginalInteractionResponse = async (interaction: APIInteraction): Promise<Response> => {
  return await fetch(
    `${RouteBases.api}${Routes.webhookMessage(interaction.application_id, interaction.token, 'original')}`,
    {
      method: 'DELETE',
    },
  );
};

export const createFollowUpMessage = async (
  interaction: APIInteraction,
  message: RESTPostAPIInteractionFollowupJSONBody,
): Promise<Response> => {
  return await fetch(`${RouteBases.api}${Routes.webhook(interaction.application_id, interaction.token)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  });
};

export const getFollowUpMessage = async (interaction: APIInteraction, messageId: string): Promise<Response> => {
  return await fetch(
    `${RouteBases.api}${Routes.webhookMessage(interaction.application_id, interaction.token, messageId)}`,
    {
      method: 'GET',
    },
  );
};

export const editFollowUpMessage = async (
  interaction: APIInteraction,
  message: RESTPatchAPIInteractionFollowupJSONBody,
  messageId: string,
): Promise<Response> => {
  console.log(interaction);
  console.log(message);
  console.log(messageId);
  return await fetch(
    `${RouteBases.api}${Routes.webhookMessage(interaction.application_id, interaction.token, messageId)}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    },
  );
};

export const deleteFollowUpMessage = async (interaction: APIInteraction, messageId: string): Promise<Response> => {
  return await fetch(
    `${RouteBases.api}${Routes.webhookMessage(interaction.application_id, interaction.token, messageId)}`,
    {
      method: 'DELETE',
    },
  );
};
