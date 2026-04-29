import { ensureAuthenticated, getApiUrl, internalHeaders } from "$lib/server/api";
import type { Military, User } from "$lib/types";
import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ cookies, platform, locals }) => {
  const apiUrl = getApiUrl(platform);
  const accessToken = cookies.get("access_token");

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    ...internalHeaders(platform),
  };

  const [usersRes, militaryRes] = await Promise.all([
    fetch(`${apiUrl}/user`, { headers }),
    fetch(`${apiUrl}/military`, { headers }),
  ]);

  ensureAuthenticated(usersRes, cookies);
  ensureAuthenticated(militaryRes, cookies);

  const { data: users }: { data: User[] } = await usersRes.json();
  const { data: military }: { data: Military[] } = await militaryRes.json();

  return { users: users ?? [], military: military ?? [], currentUserRole: locals.user?.role };
};

export const actions: Actions = {
  create: async ({ request, cookies, platform }) => {
    const apiUrl = getApiUrl(platform);
    const accessToken = cookies.get("access_token");
    const data = await request.formData();

    const response = await fetch(`${apiUrl}/user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...internalHeaders(platform),
      },
      body: JSON.stringify({
        militaryId: data.get("militaryId"),
        role: data.get("role"),
        password: data.get("password"),
      }),
    });

    ensureAuthenticated(response, cookies);

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return fail(response.status, {
        message: body.error ?? "Erro ao criar usuário.",
      });
    }
  },

  updateRole: async ({ request, cookies, platform }) => {
    const apiUrl = getApiUrl(platform);
    const accessToken = cookies.get("access_token");
    const data = await request.formData();

    const response = await fetch(
      `${apiUrl}/user/update-role/${data.get("id")}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          ...internalHeaders(platform),
        },
        body: JSON.stringify({ role: data.get("role") }),
      },
    );

    ensureAuthenticated(response, cookies);

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return fail(response.status, {
        message: body.error ?? "Erro ao atualizar perfil do usuário.",
      });
    }
  },

  delete: async ({ request, cookies, platform }) => {
    const apiUrl = getApiUrl(platform);
    const accessToken = cookies.get("access_token");
    const data = await request.formData();

    const response = await fetch(`${apiUrl}/user/${data.get("id")}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...internalHeaders(platform),
      },
    });

    ensureAuthenticated(response, cookies);

    if (!response.ok) {
      return fail(response.status, { message: "Erro ao excluir usuário." });
    }
  },
};
