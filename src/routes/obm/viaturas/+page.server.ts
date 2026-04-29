import { fail } from "@sveltejs/kit";
import { ensureAuthenticated, getApiUrl, internalHeaders } from "$lib/server/api";
import type { Vehicle } from "$lib/types";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ cookies, platform }) => {
  const apiUrl = getApiUrl(platform);
  const accessToken = cookies.get("access_token");

  const response = await fetch(`${apiUrl}/vehicle`, {
    headers: { Authorization: `Bearer ${accessToken}`, ...internalHeaders(platform) },
  });

  ensureAuthenticated(response, cookies);

  const { data: vehicles }: { data: Vehicle[] } = await response.json();

  return { vehicles: vehicles ?? [] };
};

export const actions: Actions = {
  create: async ({ request, cookies, platform }) => {
    const apiUrl = getApiUrl(platform);
    const accessToken = cookies.get("access_token");
    const data = await request.formData();

    const complement = data.get("complement");
    const response = await fetch(`${apiUrl}/vehicle`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...internalHeaders(platform),
      },
      body: JSON.stringify({
        name: data.get("name"),
        situation: data.get("situation"),
        complement: complement ? complement : undefined,
      }),
    });

    ensureAuthenticated(response, cookies);

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return fail(response.status, { message: body.error ?? "Erro ao criar viatura." });
    }
  },

  update: async ({ request, cookies, platform }) => {
    const apiUrl = getApiUrl(platform);
    const accessToken = cookies.get("access_token");
    const data = await request.formData();

    const complement = data.get("complement");
    const response = await fetch(`${apiUrl}/vehicle/${data.get("id")}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...internalHeaders(platform),
      },
      body: JSON.stringify({
        name: data.get("name"),
        situation: data.get("situation"),
        complement: complement ? complement : undefined,
      }),
    });

    ensureAuthenticated(response, cookies);

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return fail(response.status, { message: body.error ?? "Erro ao atualizar viatura." });
    }
  },

  delete: async ({ request, cookies, platform }) => {
    const apiUrl = getApiUrl(platform);
    const accessToken = cookies.get("access_token");
    const data = await request.formData();

    const response = await fetch(`${apiUrl}/vehicle/${data.get("id")}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}`, ...internalHeaders(platform) },
    });

    ensureAuthenticated(response, cookies);

    if (!response.ok) {
      return fail(response.status, { message: "Erro ao excluir viatura" });
    }
  },
};
