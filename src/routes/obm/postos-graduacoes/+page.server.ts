import { fail } from "@sveltejs/kit";
import { getApiUrl } from "$lib/server/api";
import type { MilitaryRank } from "$lib/types";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ cookies, platform }) => {
  const apiUrl = getApiUrl(platform);
  const accessToken = cookies.get("access_token");

  const response = await fetch(`${apiUrl}/military-rank`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const { data: ranks }: { data: MilitaryRank[] } = await response.json();

  return { ranks: ranks ?? [] };
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
      },
      body: JSON.stringify({
        abbreviation: data.get("abbreviation"),
        order: Number(data.get("order")),
      }),
    });

    if (!response.ok) {
      return fail(response.status, { message: "Erro ao criar posto/graduação" });
    }
  },

  update: async ({ request, cookies, platform }) => {
    const apiUrl = getApiUrl(platform);
    const accessToken = cookies.get("access_token");
    const data = await request.formData();

    const response = await fetch(`${apiUrl}/military-rank/${data.get("id")}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        abbreviation: data.get("abbreviation"),
        order: Number(data.get("order")),
      }),
    });

    if (!response.ok) {
      return fail(response.status, { message: "Erro ao atualizar posto/graduação" });
    }
  },

  delete: async ({ request, cookies, platform }) => {
    const apiUrl = getApiUrl(platform);
    const accessToken = cookies.get("access_token");
    const data = await request.formData();

    const response = await fetch(`${apiUrl}/military-rank/${data.get("id")}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      return fail(response.status, { message: "Erro ao excluir posto/graduação" });
    }
  },
};
