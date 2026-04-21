import { fail } from "@sveltejs/kit";
import { getApiUrl } from "$lib/server/api";
import type { Military, MilitaryRank } from "$lib/types";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ cookies, platform }) => {
  const apiUrl = getApiUrl(platform);
  const accessToken = cookies.get("access_token");

  const headers = { Authorization: `Bearer ${accessToken}` };

  const [militaryRes, ranksRes] = await Promise.all([
    fetch(`${apiUrl}/military`, { headers }),
    fetch(`${apiUrl}/military-rank`, { headers }),
  ]);

  const { data: military }: { data: Military[] } = await militaryRes.json();
  const { data: ranks }: { data: MilitaryRank[] } = await ranksRes.json();

  return { military: military ?? [], ranks: ranks ?? [] };
};

export const actions: Actions = {
  create: async ({ request, cookies, platform }) => {
    const apiUrl = getApiUrl(platform);
    const accessToken = cookies.get("access_token");
    const data = await request.formData();

    const response = await fetch(`${apiUrl}/military`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        militaryRankId: data.get("militaryRankId"),
        rg: Number(data.get("rg")),
        name: data.get("name"),
      }),
    });

    if (!response.ok) {
      return fail(response.status, {
        message: "Erro ao criar militar",
      });
    }
  },

  update: async ({ request, cookies, platform }) => {
    const apiUrl = getApiUrl(platform);
    const accessToken = cookies.get("access_token");
    const data = await request.formData();

    const response = await fetch(`${apiUrl}/military/${data.get("id")}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        militaryRankId: data.get("militaryRankId"),
        rg: Number(data.get("rg")),
        name: data.get("name"),
      }),
    });

    if (!response.ok) {
      return fail(response.status, {
        message: "Erro ao atualizar militar",
      });
    }
  },

  delete: async ({ request, cookies, platform }) => {
    const apiUrl = getApiUrl(platform);
    const accessToken = cookies.get("access_token");
    const data = await request.formData();

    const response = await fetch(`${apiUrl}/military/${data.get("id")}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      return fail(response.status, {
        message: "Erro ao excluir militar",
      });
    }
  },
};
