import { getApiUrl, internalHeaders, isProd, jwtSecondsUntilExpiry } from "$lib/server/api";
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

    // No login só verificamos presença; a política de complexidade pertence ao
    // cadastro/troca de senha. Validá-la aqui vaza a regra e bloqueia senhas
    // legadas válidas. Credenciais incorretas retornam erro genérico da API.
    if (!password || password.trim() === "") return fail(400, { message: "Senha é obrigatória." });

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
      // Mantém o cookie sincronizado com a expiração real do refresh token,
      // independente da configuração de tempo de vida na API (fallback: 7 dias).
      maxAge: jwtSecondsUntilExpiry(body.refreshToken, 60 * 60 * 24 * 7),
    });

    redirect(303, "/obm");
  },
};
