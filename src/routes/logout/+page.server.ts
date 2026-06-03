import { redirect } from "@sveltejs/kit";
import { getApiUrl, internalHeaders } from "$lib/server/api";
import type { Actions, PageServerLoad } from "./$types";

// Logout é uma operação que altera estado (revoga a sessão e apaga cookies),
// portanto só pode ocorrer via POST. Um acesso GET direto apenas volta ao login.
export const load: PageServerLoad = () => {
  redirect(303, "/login");
};

export const actions: Actions = {
  default: async ({ cookies, platform }) => {
    const apiUrl = getApiUrl(platform);
    const refreshToken = cookies.get("refresh_token");

    await fetch(`${apiUrl}/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...internalHeaders(platform),
      },
      body: JSON.stringify({ refreshToken }),
    }).catch(() => {});

    cookies.delete("access_token", { path: "/" });
    cookies.delete("refresh_token", { path: "/" });

    redirect(303, "/login");
  },
};
