import { fail } from "@sveltejs/kit";
import { ensureAuthenticated, getApiUrl, internalHeaders, pathSegment, readList } from "$lib/server/api";
import type { MilitaryRank } from "$lib/types";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ cookies, platform }) => {
  const apiUrl = getApiUrl(platform);
  const accessToken = cookies.get("access_token");

  const response = await fetch(`${apiUrl}/military-rank`, {
    headers: { Authorization: `Bearer ${accessToken}`, ...internalHeaders(platform) },
  });

  ensureAuthenticated(response, cookies);

  const ranks = await readList<MilitaryRank>(response);

  return { ranks };
};

export const actions: Actions = {
  create: async ({ request, cookies, platform }) => {
    const apiUrl = getApiUrl(platform);
    const accessToken = cookies.get("access_token");
    const data = await request.formData();

    const response = await fetch(`${apiUrl}/military-rank`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...internalHeaders(platform),
      },
      body: JSON.stringify({
        abbreviation: data.get("abbreviation"),
        order: Number(data.get("order")),
      }),
    });

    ensureAuthenticated(response, cookies);

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return fail(response.status, { message: body.error ?? "Erro ao criar posto/graduação." });
    }
  },

  update: async ({ request, cookies, platform }) => {
    const apiUrl = getApiUrl(platform);
    const accessToken = cookies.get("access_token");
    const data = await request.formData();

    const response = await fetch(`${apiUrl}/military-rank/${pathSegment(data.get("id"))}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...internalHeaders(platform),
      },
      body: JSON.stringify({
        abbreviation: data.get("abbreviation"),
        order: Number(data.get("order")),
      }),
    });

    ensureAuthenticated(response, cookies);

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return fail(response.status, { message: body.error ?? "Erro ao atualizar posto/graduação." });
    }
  },

  delete: async ({ request, cookies, platform }) => {
    const apiUrl = getApiUrl(platform);
    const accessToken = cookies.get("access_token");
    const data = await request.formData();

    const response = await fetch(`${apiUrl}/military-rank/${pathSegment(data.get("id"))}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}`, ...internalHeaders(platform) },
    });

    ensureAuthenticated(response, cookies);

    if (!response.ok) {
      return fail(response.status, { message: "Erro ao excluir posto/graduação" });
    }
  },
};
