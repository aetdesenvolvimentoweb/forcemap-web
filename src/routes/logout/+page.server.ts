import { redirect } from "@sveltejs/kit";
import { getApiUrl, internalHeaders } from "$lib/server/api";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ cookies, platform }) => {
  const apiUrl = getApiUrl(platform);
  const refreshToken = cookies.get("refresh_token");

  await fetch(`${apiUrl}/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...internalHeaders(platform) },
    body: JSON.stringify({ refreshToken }),
  }).catch(() => {});

  cookies.delete("access_token", { path: "/" });
  cookies.delete("refresh_token", { path: "/" });

  redirect(303, "/login");
};
