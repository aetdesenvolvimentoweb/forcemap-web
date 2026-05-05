import {
  ensureAuthenticated,
  getApiUrl,
  internalHeaders,
} from "$lib/server/api";
import type {
  ACA,
  Garrison,
  Military,
  Officer,
  Telephonist,
  Vehicle,
} from "$lib/types";
import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ cookies, platform }) => {
  const apiUrl = getApiUrl(platform);
  const accessToken = cookies.get("access_token");

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    ...internalHeaders(platform),
  };

  const [
    vehiclesRes,
    officersRes,
    acasRes,
    telephonistsRes,
    garrisonsRes,
    militaryRes,
  ] = await Promise.all([
    fetch(`${apiUrl}/vehicle`, { headers }),
    fetch(`${apiUrl}/officer`, { headers }),
    fetch(`${apiUrl}/aca`, { headers }),
    fetch(`${apiUrl}/telephonist`, { headers }),
    fetch(`${apiUrl}/garrison`, { headers }),
    fetch(`${apiUrl}/military`, { headers }),
  ]);

  ensureAuthenticated(vehiclesRes, cookies);
  ensureAuthenticated(officersRes, cookies);
  ensureAuthenticated(acasRes, cookies);
  ensureAuthenticated(telephonistsRes, cookies);
  ensureAuthenticated(garrisonsRes, cookies);
  ensureAuthenticated(militaryRes, cookies);

  const { data: vehicles }: { data: Vehicle[] } = await vehiclesRes.json();
  const { data: officers }: { data: Officer[] } = await officersRes.json();
  const { data: acas }: { data: ACA[] } = await acasRes.json();
  const { data: telephonists }: { data: Telephonist[] } =
    await telephonistsRes.json();
  const { data: garrisons }: { data: Garrison[] } = await garrisonsRes.json();
  const { data: military }: { data: Military[] } = await militaryRes.json();

  return {
    vehicles: vehicles ?? [],
    officers: officers ?? [],
    acas: acas ?? [],
    telephonists: telephonists ?? [],
    garrisons: garrisons ?? [],
    military: military ?? [],
  };
};

export const actions: Actions = {
  reset: async ({ cookies, platform }) => {
    const apiUrl = getApiUrl(platform);
    const accessToken = cookies.get("access_token");

    const headers = {
      Authorization: `Bearer ${accessToken}`,
      ...internalHeaders(platform),
    };

    const [officersRes, acasRes, telephonistsRes, garrisonsRes] =
      await Promise.all([
        fetch(`${apiUrl}/officer`, { headers }),
        fetch(`${apiUrl}/aca`, { headers }),
        fetch(`${apiUrl}/telephonist`, { headers }),
        fetch(`${apiUrl}/garrison`, { headers }),
      ]);

    ensureAuthenticated(officersRes, cookies);
    ensureAuthenticated(acasRes, cookies);
    ensureAuthenticated(telephonistsRes, cookies);
    ensureAuthenticated(garrisonsRes, cookies);

    const [officersJson, acasJson, telephonistsJson, garrisonsJson] =
      await Promise.all([
        officersRes.json(),
        acasRes.json(),
        telephonistsRes.json(),
        garrisonsRes.json(),
      ]);

    const officers: Officer[] = officersJson.data ?? [];
    const acas: ACA[] = acasJson.data ?? [];
    const telephonists: Telephonist[] = telephonistsJson.data ?? [];
    const garrisons: Garrison[] = garrisonsJson.data ?? [];

    const deletes: Promise<Response>[] = [
      ...officers.map((o) =>
        fetch(`${apiUrl}/officer/${o.id}`, { method: "DELETE", headers }),
      ),
      ...acas.map((a) =>
        fetch(`${apiUrl}/aca/${a.id}`, { method: "DELETE", headers }),
      ),
      ...telephonists.map((t) =>
        fetch(`${apiUrl}/telephonist/${t.id}`, { method: "DELETE", headers }),
      ),
      ...garrisons.map((g) =>
        fetch(`${apiUrl}/garrison/${g.id}`, { method: "DELETE", headers }),
      ),
    ];

    const results = await Promise.all(deletes);
    for (const r of results) ensureAuthenticated(r, cookies);

    const failed = results.filter((r) => !r.ok).length;
    if (failed > 0) {
      return fail(500, {
        message: `Falha ao limpar ${failed} item(ns) do resumo.`,
      });
    }
  },
};
