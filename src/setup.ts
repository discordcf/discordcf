import { btoa } from '../utils/utils';
import { ApplicationCommand, InteractionHandler } from "./types";

const getAuthorizationCode = async (headers: any) => {
  headers['Content-Type'] = 'application/x-www-form-urlencoded'

  const request = new Request("https://discord.com/api/oauth2/token", {
    method: "POST",
    body: new URLSearchParams({
      grant_type: "client_credentials",
      scope: "applications.commands.update",
    }).toString(),
    headers: headers,
  });

  const response = await fetch(request);

  if (!response.ok) throw new Error("Failed to request an Authorization code.");

  try {
    const data = await response.json();
    return data.access_token;
  } catch {
    throw new Error("Failed to parse the Authorization code response.");
  }
};


const resolveCommandsEndpoint = (applicationId: string, guildId?: string): string => {
  const url = `https://discord.com/api/v8/applications/${applicationId}`;

  if (guildId) {
    return `${url}/guilds/${guildId}/commands`
  }

  return `${url}/commands`;
}

const deleteExistingCommands = async (applicationId: string, bearer: any, guildId?: string): Promise<void> => {
  const url = resolveCommandsEndpoint(applicationId, guildId);

  const request = new Request(url, {
    method: "GET",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${bearer}` },
  });

  const response = await fetch(request);
  const commands = await response.json();

  await Promise.all(
    commands.map(
      (
        command: ApplicationCommand & { id: string; application_id: string }
      ) => {
        return fetch(
          `${url}/${command.id}`,
          {
            method: "DELETE",
            headers: { Authorizaton: `Bearer ${bearer}`}
          }
        );
      }
    )
  );
};

const createCommands = async (
  {
    applicationId,
    guildId,
    commands,
  }: {
    applicationId: string;
    guildId?: string;
    commands: [ApplicationCommand, InteractionHandler][];
  },
  bearer: any
): Promise<Response> => {

  const url = resolveCommandsEndpoint(applicationId, guildId);

  const promises = commands.map(async ([command, handler]) => {
    const request = new Request(url, {
      method: "POST",
      body: JSON.stringify(command),
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${bearer}` },
    });

    const error = new Error(`Setting command ${command.name} failed!`);

    try {
      const response = await fetch(request);

      if (!response.ok) throw error;
      return response;
    } catch (e) {
      throw error;
    }
  });

  return await Promise.all(promises)
    .then(() => new Response("OK"))
    .catch((e) => new Response(e.message, { status: 502 }));
};

export const setup = ({
  applicationId,
  applicationSecret,
  guildId,
  commands,
}: {
  applicationId: string;
  applicationSecret: string;
  guildId?: string;
  commands: [ApplicationCommand, InteractionHandler][];
}) => {

  const authorization = btoa(unescape(encodeURIComponent(applicationId + ':' + applicationSecret)))

  const headers = {
      Authorization: `Basic ${authorization}`
  }
  
  return async (): Promise<Response> => {
    try {
      const bearer = await getAuthorizationCode(headers);

      await deleteExistingCommands(applicationId, bearer);
      return await createCommands({ applicationId, guildId, commands }, bearer);
    } catch {
      return new Response(
        JSON.stringify({error: "Failed to authenticate with Discord. Are the Application ID and secret set correctly?"}),
        { status: 407, headers: {"Content-Type": "application/json"} }
      );
    }
  };
};
