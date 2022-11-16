import {
  APIInteraction,
  APIInteractionResponse,
  RESTPatchAPIInteractionFollowupJSONBody,
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
  return await fetch(`${RouteBases.api}${Routes.webhookMessage(interaction.id, interaction.token, 'original')}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
};

export const createFollowUpMessage = async (
  interaction: APIInteraction,
  message: RESTPostAPIInteractionFollowupJSONBody,
): Promise<Response> => {
  console.log(interaction);
  return await fetch(`${RouteBases.api}${Routes.webhookMessage(interaction.id, interaction.token)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  });
};

export const getFollowUpMessage = async (interaction: APIInteraction): Promise<Response> => {
  return await fetch(`${RouteBases.api}${Routes.webhookMessage(interaction.id, interaction.token)}`, {
    method: 'GET',
  });
};

export const editFollowUpMessage = async (
  interaction: APIInteraction,
  message: RESTPatchAPIInteractionFollowupJSONBody,
): Promise<Response> => {
  return await fetch(`${RouteBases.api}${Routes.webhookMessage(interaction.id, interaction.token)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  });
};

export const deleteFollowUpMessage = async (interaction: APIInteraction): Promise<Response> => {
  return await fetch(`${RouteBases.api}${Routes.webhookMessage(interaction.id, interaction.token)}`, {
    method: 'DELETE',
  });
};
