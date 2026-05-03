import { ensureAuthenticated, getApiUrl, internalHeaders } from "$lib/server/api";
import type { Military, Telephonist } from "$lib/types";
import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ cookies, platform }) => {
  const apiUrl = getApiUrl(platform);
  const accessToken = cookies.get("access_token");

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    ...internalHeaders(platform),
  };

  const [telephonistsRes, militaryRes] = await Promise.all([
    fetch(`${apiUrl}/telephonist`, { headers }),
    fetch(`${apiUrl}/military`, { headers }),
  ]);

  ensureAuthenticated(telephonistsRes, cookies);
  ensureAuthenticated(militaryRes, cookies);

  const { data: telephonists }: { data: Telephonist[] } =
    await telephonistsRes.json();
  const { data: military }: { data: Military[] } = await militaryRes.json();

  return { telephonists: telephonists ?? [], military: military ?? [] };
};

export const actions: Actions = {
  create: async ({ request, cookies, platform }) => {
    const apiUrl = getApiUrl(platform);
    const accessToken = cookies.get("access_token");
    const data = await request.formData();

    const response = await fetch(`${apiUrl}/telephonist`, {
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
        message: body.error ?? "Erro ao cadastrar telefonista.",
      });
    }
  },

  update: async ({ request, cookies, platform }) => {
    const apiUrl = getApiUrl(platform);
    const accessToken = cookies.get("access_token");
    const data = await request.formData();

    const response = await fetch(`${apiUrl}/telephonist/${data.get("id")}`, {
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
        message: body.error ?? "Erro ao atualizar telefonista.",
      });
    }
  },

  delete: async ({ request, cookies, platform }) => {
    const apiUrl = getApiUrl(platform);
    const accessToken = cookies.get("access_token");
    const data = await request.formData();

    const response = await fetch(`${apiUrl}/telephonist/${data.get("id")}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...internalHeaders(platform),
      },
    });

    ensureAuthenticated(response, cookies);

    if (!response.ok) {
      return fail(response.status, { message: "Erro ao excluir telefonista." });
    }
  },
};
