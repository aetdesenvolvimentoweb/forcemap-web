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
  ServiceSwap,
  Telephonist,
  Vehicle,
} from "$lib/types";
import { currentServiceDate } from "$lib/utils/datetime";
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
    serviceSwapsRes,
  ] = await Promise.all([
    fetch(`${apiUrl}/vehicle`, { headers }),
    fetch(`${apiUrl}/officer`, { headers }),
    fetch(`${apiUrl}/aca`, { headers }),
    fetch(`${apiUrl}/telephonist`, { headers }),
    fetch(`${apiUrl}/garrison`, { headers }),
    fetch(`${apiUrl}/military`, { headers }),
    fetch(`${apiUrl}/service-swap`, { headers }),
  ]);

  ensureAuthenticated(vehiclesRes, cookies);
  ensureAuthenticated(officersRes, cookies);
  ensureAuthenticated(acasRes, cookies);
  ensureAuthenticated(telephonistsRes, cookies);
  ensureAuthenticated(garrisonsRes, cookies);
  ensureAuthenticated(militaryRes, cookies);
  ensureAuthenticated(serviceSwapsRes, cookies);

  const { data: vehicles }: { data: Vehicle[] } = await vehiclesRes.json();
  const { data: officers }: { data: Officer[] } = await officersRes.json();
  const { data: acas }: { data: ACA[] } = await acasRes.json();
  const { data: telephonists }: { data: Telephonist[] } =
    await telephonistsRes.json();
  const { data: garrisons }: { data: Garrison[] } = await garrisonsRes.json();
  const { data: military }: { data: Military[] } = await militaryRes.json();
  const { data: serviceSwaps }: { data: ServiceSwap[] } =
    await serviceSwapsRes.json();

  const serviceDateRes = await fetch(`${apiUrl}/public/service-date`, {
    headers,
  });
  const serviceDateJson = await serviceDateRes
    .json()
    .catch(() => ({ data: { date: null } }));
  const serviceDate: string =
    serviceDateJson?.data?.date ?? currentServiceDate();

  return {
    vehicles: vehicles ?? [],
    officers: officers ?? [],
    acas: acas ?? [],
    telephonists: telephonists ?? [],
    garrisons: garrisons ?? [],
    military: military ?? [],
    serviceSwaps: serviceSwaps ?? [],
    serviceDate,
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

    const [officersRes, acasRes, telephonistsRes, garrisonsRes, serviceSwapsRes] =
      await Promise.all([
        fetch(`${apiUrl}/officer`, { headers }),
        fetch(`${apiUrl}/aca`, { headers }),
        fetch(`${apiUrl}/telephonist`, { headers }),
        fetch(`${apiUrl}/garrison`, { headers }),
        fetch(`${apiUrl}/service-swap`, { headers }),
      ]);

    ensureAuthenticated(officersRes, cookies);
    ensureAuthenticated(acasRes, cookies);
    ensureAuthenticated(telephonistsRes, cookies);
    ensureAuthenticated(garrisonsRes, cookies);
    ensureAuthenticated(serviceSwapsRes, cookies);

    const [
      officersJson,
      acasJson,
      telephonistsJson,
      garrisonsJson,
      serviceSwapsJson,
    ] = await Promise.all([
      officersRes.json(),
      acasRes.json(),
      telephonistsRes.json(),
      garrisonsRes.json(),
      serviceSwapsRes.json(),
    ]);

    const officers: Officer[] = officersJson.data ?? [];
    const acas: ACA[] = acasJson.data ?? [];
    const telephonists: Telephonist[] = telephonistsJson.data ?? [];
    const garrisons: Garrison[] = garrisonsJson.data ?? [];
    const serviceSwaps: ServiceSwap[] = serviceSwapsJson.data ?? [];

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
      ...serviceSwaps.map((s) =>
        fetch(`${apiUrl}/service-swap/${s.id}`, { method: "DELETE", headers }),
      ),
    ];

    const results = await Promise.all(deletes);
    for (const r of results) ensureAuthenticated(r, cookies);

    // Vincula o resumo ao dia: grava a data do serviço como "hoje".
    const serviceDateRes = await fetch(`${apiUrl}/service-date`, {
      method: "PUT",
      headers,
    });
    ensureAuthenticated(serviceDateRes, cookies);

    const failed = results.filter((r) => !r.ok).length;
    if (failed > 0 || !serviceDateRes.ok) {
      return fail(500, {
        message: `Falha ao iniciar novo resumo.`,
      });
    }
  },
};
