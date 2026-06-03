import {
  ensureAuthenticated,
  getApiUrl,
  internalHeaders,
  pathSegment,
} from "$lib/server/api";
import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = () => {
  redirect(303, "/obm");
};

const parsePayload = (data: FormData) => {
  const raw = data.get("militaryInGarrison");
  let militaryInGarrison: unknown = [];
  if (typeof raw === "string" && raw.length > 0) {
    try {
      militaryInGarrison = JSON.parse(raw);
    } catch {
      militaryInGarrison = [];
    }
  }
  return {
    vehicleId: data.get("vehicleId"),
    militaryInGarrison,
  };
};

export const actions: Actions = {
  create: async ({ request, cookies, platform }) => {
    const apiUrl = getApiUrl(platform);
    const accessToken = cookies.get("access_token");
    const data = await request.formData();

    const response = await fetch(`${apiUrl}/garrison`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...internalHeaders(platform),
      },
      body: JSON.stringify(parsePayload(data)),
    });

    ensureAuthenticated(response, cookies);

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return fail(response.status, {
        message: body.error ?? "Erro ao cadastrar guarnição.",
      });
    }
  },

  update: async ({ request, cookies, platform }) => {
    const apiUrl = getApiUrl(platform);
    const accessToken = cookies.get("access_token");
    const data = await request.formData();

    const response = await fetch(`${apiUrl}/garrison/${pathSegment(data.get("id"))}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...internalHeaders(platform),
      },
      body: JSON.stringify(parsePayload(data)),
    });

    ensureAuthenticated(response, cookies);

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return fail(response.status, {
        message: body.error ?? "Erro ao atualizar guarnição.",
      });
    }
  },

  delete: async ({ request, cookies, platform }) => {
    const apiUrl = getApiUrl(platform);
    const accessToken = cookies.get("access_token");
    const data = await request.formData();

    const response = await fetch(`${apiUrl}/garrison/${pathSegment(data.get("id"))}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...internalHeaders(platform),
      },
    });

    ensureAuthenticated(response, cookies);

    if (!response.ok) {
      return fail(response.status, { message: "Erro ao excluir guarnição." });
    }
  },
};
