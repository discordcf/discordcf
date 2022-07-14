import { Permissions } from "./permissions";
import { OAuth2Routes } from "discord-api-types/v10";

export const authorize = (applicationId: string, permissions: Permissions) => async (): Promise<Response> => {
  const urlSearchParams = new URLSearchParams({
    client_id: applicationId,
    scope: "bot applications.commands",
    permissions: permissions.compute(),
  });

  const redirectURL = new URL(OAuth2Routes.authorizationURL);
  redirectURL.search = urlSearchParams.toString();

  return new Response(null, {
    status: 301,
    headers: { Location: redirectURL.toString() },
  });
};
