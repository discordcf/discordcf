import { type RESTGetAPIApplicationCommandsResult, Routes, RouteBases } from './types';
import type { Application, Command } from './handler';

const resolveCommandsEndpoint = (applicationId: string, guildId?: string): string => {
  if (guildId !== undefined) return RouteBases.api + Routes.applicationGuildCommands(applicationId, guildId);
  return RouteBases.api + Routes.applicationCommands(applicationId);
};

const deleteExistingCommands = async (applicationId: string, botToken: string, guildId?: string): Promise<void> => {
  const url = resolveCommandsEndpoint(applicationId, guildId);

  const commands = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: `Bot ${botToken}` },
  }).then(async (res) => await (res.json() as Promise<RESTGetAPIApplicationCommandsResult>));

  await Promise.all(
    commands.map(
      async (command) =>
        await fetch(`${url}/${command.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bot ${botToken}` },
        }),
    ),
  );
};

interface CreateCommandsArgs {
  applicationId: string;
  guildId?: string;
  commands: Array<Command<any>>;
}

const createCommands = async (
  { applicationId, guildId, commands }: CreateCommandsArgs,
  botToken: string,
): Promise<Response> => {
  const url = resolveCommandsEndpoint(applicationId, guildId);

  const promises = commands.map(async ([command, _]) => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(command),
        headers: { 'Content-Type': 'application/json', Authorization: `Bot ${botToken}` },
      });

      return { [command.name]: await response.json() };
    } catch (e: unknown) {
      /*
       * e is typeof unknown due to error handling. We expect it to be a Error,
       * if its not then the message and stack properties should be undefined and not used.
       */
      const { message, stack } = e as Error;

      return {
        [command.name]: {
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

export const setup = ({ applicationId, botToken, guildId, commands }: Application) => {
  return async (): Promise<Response> => {
    try {
      await deleteExistingCommands(applicationId, botToken, guildId);
      return await createCommands({ applicationId, guildId, commands }, botToken);
    } catch {
      return new Response(
        JSON.stringify({
          error: 'Failed to authenticate with Discord. Are the Application ID and secret set correctly?',
        }),
        {
          status: 407,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
  };
};
