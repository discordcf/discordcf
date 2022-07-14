import { Routes, RouteBases } from "discord-api-types/v10";
import { RESTGetAPIApplicationCommandsResult } from "discord-api-types/v10";

import type { Application, Command } from "./handler";

const resolveCommandsEndpoint = (applicationId: string, guildId?: string): string => {
  if (guildId !== undefined) return RouteBases.api + Routes.applicationGuildCommands(applicationId, guildId);
  return RouteBases.api + Routes.applicationCommands(applicationId);
};

const deleteExistingCommands = async (applicationId: string, applicationSecret: string, guildId?: string): Promise<void> => {
  const url = resolveCommandsEndpoint(applicationId, guildId);

  const response = await fetch(
    new Request(url, {
      method: "GET",
      headers: { "Content-Type": "application/json", Authorization: `Bot ${applicationSecret}` },
    })
  );
  const commands = <RESTGetAPIApplicationCommandsResult>await response.json();

  await Promise.all(
    commands.map((command) =>
      fetch(`${url}/${command.id}`, {
        method: "DELETE",
        headers: { Authorizaton: `Bot ${applicationSecret}` },
      })
    )
  );
};

type createCommandsArgs = {
  applicationId: string;
  guildId?: string;
  commands: Command<any>[];
};
const createCommands = async ({ applicationId, guildId, commands }: createCommandsArgs, applicationSecret: string): Promise<Response> => {
  const url = resolveCommandsEndpoint(applicationId, guildId);

  const promises = commands.map(async ([command, handler]) => {
    const request = new Request(url, {
      method: "POST",
      body: JSON.stringify(command),
      headers: { "Content-Type": "application/json", Authorization: `Bot ${applicationSecret}` },
    });

    try {
      const response = await fetch(request);

      return { [command.name!]: await response.json() };
    } catch (e: unknown) {
      // e is typeof unknown due to error handling. We expect it to be a Error, if its not then the message and stack properties should be undefined and not used.
      const { message, stack } = <Error>e;
      return {
        [command.name!]: {
          message,
          stack,
          info: `Setting command ${command.name} failed!`,
        },
      };
    }
  });

  return await Promise.all(promises)
    .then((result) => new Response(JSON.stringify(result.reduce((acc, cur) => ({ ...acc, ...cur }), {}))))
    .catch((e) => new Response(e.message, { status: 502 }));
};

export const setup = ({ applicationId, applicationSecret, guildId, commands }: Application) => {
  return async (): Promise<Response> => {
    try {
      await deleteExistingCommands(applicationId, applicationSecret);
      return await createCommands({ applicationId, guildId, commands }, applicationSecret);
    } catch {
      return new Response(JSON.stringify({ error: "Failed to authenticate with Discord. Are the Application ID and secret set correctly?" }), {
        status: 407,
        headers: { "Content-Type": "application/json" },
      });
    }
  };
};
