import { getApiUrl } from "$lib/server/api";
import type { MilitaryRank } from "$lib/types";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ cookies, platform }) => {
  const apiUrl = getApiUrl(platform);
  const accessToken = cookies.get("access_token");

  const response = await fetch(`${apiUrl}/military-rank`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const { data: ranks }: { data: MilitaryRank[] } = await response.json();

  return { ranks };
};
