import { getApiUrl, internalHeaders } from "$lib/server/api";
import type { Military } from "$lib/types";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals, cookies, platform }) => {
  const apiUrl = getApiUrl(platform);
  const accessToken = cookies.get("access_token");

  const response = await fetch(
    `${apiUrl}/military/${locals.user!.militaryId}`,
    {
      headers: { Authorization: `Bearer ${accessToken}`, ...internalHeaders(platform) },
    },
  );

  const { data: military }: { data: Military } = await response.json();
  return { user: military };
};
