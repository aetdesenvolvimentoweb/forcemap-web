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

    if (!rg || isNaN(rg)) return fail(400, { message: "RG é obrigatório." });
    if (rg < 1 || rg > 10000) return fail(400, { message: "RG deve estar entre 1 e 10000." });

    if (!password || password.trim() === "") return fail(400, { message: "Senha é obrigatória." });
    if (password.length < 8) return fail(400, { message: "Senha deve ter pelo menos 8 caracteres." });
    if (!/[A-Z]/.test(password)) return fail(400, { message: "Senha deve conter pelo menos 1 letra maiúscula." });
    if (!/[a-z]/.test(password)) return fail(400, { message: "Senha deve conter pelo menos 1 letra minúscula." });
    if (!/[0-9]/.test(password)) return fail(400, { message: "Senha deve conter pelo menos 1 número." });
    if (!/[!@#$%^&*()_+=[\]{};':"\\|,.<>/?-]/.test(password)) return fail(400, { message: "Senha deve conter pelo menos 1 caractere especial." });

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
