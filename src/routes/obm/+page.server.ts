import { ensureAuthenticated, getApiUrl, internalHeaders } from "$lib/server/api";
import type {
  ACA,
  Garrison,
  Officer,
  Telephonist,
  Vehicle,
} from "$lib/types";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ cookies, platform }) => {
  const apiUrl = getApiUrl(platform);
  const accessToken = cookies.get("access_token");

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    ...internalHeaders(platform),
  };

  const [vehiclesRes, officersRes, acasRes, telephonistsRes, garrisonsRes] =
    await Promise.all([
      fetch(`${apiUrl}/vehicle`, { headers }),
      fetch(`${apiUrl}/officer`, { headers }),
      fetch(`${apiUrl}/aca`, { headers }),
      fetch(`${apiUrl}/telephonist`, { headers }),
      fetch(`${apiUrl}/garrison`, { headers }),
    ]);

  ensureAuthenticated(vehiclesRes, cookies);
  ensureAuthenticated(officersRes, cookies);
  ensureAuthenticated(acasRes, cookies);
  ensureAuthenticated(telephonistsRes, cookies);
  ensureAuthenticated(garrisonsRes, cookies);

  const { data: vehicles }: { data: Vehicle[] } = await vehiclesRes.json();
  const { data: officers }: { data: Officer[] } = await officersRes.json();
  const { data: acas }: { data: ACA[] } = await acasRes.json();
  const { data: telephonists }: { data: Telephonist[] } =
    await telephonistsRes.json();
  const { data: garrisons }: { data: Garrison[] } = await garrisonsRes.json();

  return {
    vehicles: vehicles ?? [],
    officers: officers ?? [],
    acas: acas ?? [],
    telephonists: telephonists ?? [],
    garrisons: garrisons ?? [],
  };
};
