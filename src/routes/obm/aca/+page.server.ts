import { ensureAuthenticated, getApiUrl, internalHeaders } from "$lib/server/api";
import type { ACA, Military } from "$lib/types";
import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ cookies, platform }) => {
  const apiUrl = getApiUrl(platform);
  const accessToken = cookies.get("access_token");

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    ...internalHeaders(platform),
  };

  const [acasRes, militaryRes] = await Promise.all([
    fetch(`${apiUrl}/aca`, { headers }),
    fetch(`${apiUrl}/military`, { headers }),
  ]);

  ensureAuthenticated(acasRes, cookies);
  ensureAuthenticated(militaryRes, cookies);

  const { data: acas }: { data: ACA[] } = await acasRes.json();
  const { data: military }: { data: Military[] } = await militaryRes.json();

  return { acas: acas ?? [], military: military ?? [] };
};

export const actions: Actions = {
  create: async ({ request, cookies, platform }) => {
    const apiUrl = getApiUrl(platform);
    const accessToken = cookies.get("access_token");
    const data = await request.formData();

    const response = await fetch(`${apiUrl}/aca`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...internalHeaders(platform),
      },
      body: JSON.stringify({
        militaryId: data.get("militaryId"),
        workPeriod: data.get("workPeriod"),
        workSchedule: data.get("workSchedule"),
      }),
    });

    ensureAuthenticated(response, cookies);

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return fail(response.status, {
        message: body.error ?? "Erro ao cadastrar ACA.",
      });
    }
  },

  update: async ({ request, cookies, platform }) => {
    const apiUrl = getApiUrl(platform);
    const accessToken = cookies.get("access_token");
    const data = await request.formData();

    const response = await fetch(`${apiUrl}/aca/${data.get("id")}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...internalHeaders(platform),
      },
      body: JSON.stringify({
        militaryId: data.get("militaryId"),
        workPeriod: data.get("workPeriod"),
        workSchedule: data.get("workSchedule"),
      }),
    });

    ensureAuthenticated(response, cookies);

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return fail(response.status, {
        message: body.error ?? "Erro ao atualizar ACA.",
      });
    }
  },

  delete: async ({ request, cookies, platform }) => {
    const apiUrl = getApiUrl(platform);
    const accessToken = cookies.get("access_token");
    const data = await request.formData();

    const response = await fetch(`${apiUrl}/aca/${data.get("id")}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...internalHeaders(platform),
      },
    });

    ensureAuthenticated(response, cookies);

    if (!response.ok) {
      return fail(response.status, { message: "Erro ao excluir ACA." });
    }
  },
};
