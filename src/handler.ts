import { Router } from "itty-router";
import { setup } from "./setup";
import { authorize } from "./authorize";
import { interaction } from "./interaction";
import { Permissions } from "./permissions";
import { ApplicationCommand, InteractionHandler } from "./types";

const router = Router();

export type Application = {
  applicationId: string;
  applicationSecret: string;
  publicKey: string;
  guildId?: string;
  commands: [ApplicationCommand, InteractionHandler][];
  permissions: Permissions;
};

export const createApplicationCommandHandler = (application: Application) => {
  router.get("/", authorize(application.applicationId, application.permissions));
  router.post("/interaction", interaction({ publicKey: application.publicKey, commands: application.commands }));
  router.get(
    "/setup",
    setup({
      applicationId: application.applicationId,
      applicationSecret: application.applicationSecret,
      guildId: application.guildId,
      commands: application.commands,
    })
  );
  return (request: Request) => router.handle(request);
};
