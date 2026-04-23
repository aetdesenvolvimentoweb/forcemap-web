import { getApiUrl, internalHeaders, isProd } from "$lib/server/api";
import { fail, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";

export const actions: Actions = {
  default: async ({ request, cookies, platform }) => {
    const apiUrl = getApiUrl(platform);
    const secure = isProd(platform);

    const data = await request.formData();
    const rg = Number(data.get("rg"));
    const password = data.get("password") as string;

    if (!rg || !password) {
      return fail(400, { message: "RG e senha são obrigatórios" });
    }

    const response = await fetch(`${apiUrl}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...internalHeaders(platform),
      },
      body: JSON.stringify({ rg, password }),
    });

    if (!response.ok) {
      return fail(response.status, { message: "Credenciais inválidas" });
    }

    const { data: body } = await response.json();

    cookies.set("access_token", body.accessToken, {
      httpOnly: true,
      secure: secure,
      sameSite: "lax",
      path: "/",
      maxAge: body.expiresIn,
    });

    cookies.set("refresh_token", body.refreshToken, {
      httpOnly: true,
      secure: secure,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    redirect(303, "/obm");
  },
};
