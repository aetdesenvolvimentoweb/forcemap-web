import { redirect } from "@sveltejs/kit";
import { getApiUrl } from "$lib/server/api";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = ({ locals }) => {
  return { user: locals.user };
};

export const actions: Actions = {
  logout: async ({ cookies, platform }) => {
    const apiUrl = getApiUrl(platform);
    const refreshToken = cookies.get("refresh_token");

    await fetch(`${apiUrl}/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    }).catch(() => {});

    cookies.delete("access_token", { path: "/" });
    cookies.delete("refresh_token", { path: "/" });

    redirect(303, "/login");
  },
};
