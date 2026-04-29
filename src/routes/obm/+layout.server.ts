import { ensureAuthenticated, getApiUrl, internalHeaders } from "$lib/server/api";
import type { Military } from "$lib/types";
import { error } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals, cookies, platform }) => {
  const apiUrl = getApiUrl(platform);
  const accessToken = cookies.get("access_token");

  const response = await fetch(
    `${apiUrl}/military/${locals.user!.militaryId}`,
    {
      headers: { Authorization: `Bearer ${accessToken}`, ...internalHeaders(platform) },
    },
  );

  ensureAuthenticated(response, cookies);

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message = body?.error ?? "Erro ao carregar dados do usuário.";
    throw error(response.status, message);
  }

  const { data: military }: { data: Military } = await response.json();
  return { user: military };
};
