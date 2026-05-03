import { ensureAuthenticated, getApiUrl, internalHeaders } from "$lib/server/api";
import type { Garrison, Military, Vehicle } from "$lib/types";
import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ cookies, platform }) => {
  const apiUrl = getApiUrl(platform);
  const accessToken = cookies.get("access_token");

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    ...internalHeaders(platform),
  };

  const [garrisonsRes, militaryRes, vehiclesRes] = await Promise.all([
    fetch(`${apiUrl}/garrison`, { headers }),
    fetch(`${apiUrl}/military`, { headers }),
    fetch(`${apiUrl}/vehicle`, { headers }),
  ]);

  ensureAuthenticated(garrisonsRes, cookies);
  ensureAuthenticated(militaryRes, cookies);
  ensureAuthenticated(vehiclesRes, cookies);

  const { data: garrisons }: { data: Garrison[] } = await garrisonsRes.json();
  const { data: military }: { data: Military[] } = await militaryRes.json();
  const { data: vehicles }: { data: Vehicle[] } = await vehiclesRes.json();

  return {
    garrisons: garrisons ?? [],
    military: military ?? [],
    vehicles: vehicles ?? [],
  };
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

    const response = await fetch(`${apiUrl}/garrison/${data.get("id")}`, {
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

    const response = await fetch(`${apiUrl}/garrison/${data.get("id")}`, {
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
