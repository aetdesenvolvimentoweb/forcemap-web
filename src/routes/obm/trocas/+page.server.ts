import {
  ensureAuthenticated,
  getApiUrl,
  internalHeaders,
} from "$lib/server/api";
import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = () => {
  redirect(303, "/obm");
};

export const actions: Actions = {
  create: async ({ request, cookies, platform }) => {
    const apiUrl = getApiUrl(platform);
    const accessToken = cookies.get("access_token");
    const data = await request.formData();

    const response = await fetch(`${apiUrl}/service-swap`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...internalHeaders(platform),
      },
      body: JSON.stringify({
        substitutedMilitaryId: data.get("substitutedMilitaryId"),
        substituteMilitaryId: data.get("substituteMilitaryId"),
        startsAt: data.get("startsAt"),
        endsAt: data.get("endsAt"),
      }),
    });

    ensureAuthenticated(response, cookies);

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return fail(response.status, {
        message: body.error ?? "Erro ao cadastrar troca de serviço.",
      });
    }
  },

  update: async ({ request, cookies, platform }) => {
    const apiUrl = getApiUrl(platform);
    const accessToken = cookies.get("access_token");
    const data = await request.formData();

    const response = await fetch(`${apiUrl}/service-swap/${data.get("id")}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...internalHeaders(platform),
      },
      body: JSON.stringify({
        substitutedMilitaryId: data.get("substitutedMilitaryId"),
        substituteMilitaryId: data.get("substituteMilitaryId"),
        startsAt: data.get("startsAt"),
        endsAt: data.get("endsAt"),
      }),
    });

    ensureAuthenticated(response, cookies);

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return fail(response.status, {
        message: body.error ?? "Erro ao atualizar troca de serviço.",
      });
    }
  },

  delete: async ({ request, cookies, platform }) => {
    const apiUrl = getApiUrl(platform);
    const accessToken = cookies.get("access_token");
    const data = await request.formData();

    const response = await fetch(`${apiUrl}/service-swap/${data.get("id")}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...internalHeaders(platform),
      },
    });

    ensureAuthenticated(response, cookies);

    if (!response.ok) {
      return fail(response.status, {
        message: "Erro ao excluir troca de serviço.",
      });
    }
  },
};
