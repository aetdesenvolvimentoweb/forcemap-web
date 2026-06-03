import {
  ensureAuthenticated,
  getApiUrl,
  internalHeaders,
  readList,
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

  const [
    vehicles,
    officers,
    acas,
    telephonists,
    garrisons,
    military,
    serviceSwaps,
  ] = await Promise.all([
    readList<Vehicle>(vehiclesRes),
    readList<Officer>(officersRes),
    readList<ACA>(acasRes),
    readList<Telephonist>(telephonistsRes),
    readList<Garrison>(garrisonsRes),
    readList<Military>(militaryRes),
    readList<ServiceSwap>(serviceSwapsRes),
  ]);

  const serviceDateRes = await fetch(`${apiUrl}/public/service-date`, {
    headers,
  });
  const serviceDateJson = await serviceDateRes
    .json()
    .catch(() => ({ data: { date: null } }));
  const serviceDate: string =
    serviceDateJson?.data?.date ?? currentServiceDate();

  return {
    vehicles,
    officers,
    acas,
    telephonists,
    garrisons,
    military,
    serviceSwaps,
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

    const [officers, acas, telephonists, garrisons, serviceSwaps] =
      await Promise.all([
        readList<Officer>(officersRes),
        readList<ACA>(acasRes),
        readList<Telephonist>(telephonistsRes),
        readList<Garrison>(garrisonsRes),
        readList<ServiceSwap>(serviceSwapsRes),
      ]);

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

    // Só marca o dia como reiniciado se TODA a limpeza ocorreu; caso contrário
    // o resumo ficaria vinculado ao novo dia com dados antigos remanescentes.
    const failed = results.filter((r) => !r.ok).length;
    if (failed > 0) {
      return fail(500, {
        message: "Falha ao limpar os registros do resumo anterior.",
      });
    }

    // Vincula o resumo ao dia: grava a data do serviço como "hoje".
    const serviceDateRes = await fetch(`${apiUrl}/service-date`, {
      method: "PUT",
      headers,
    });
    ensureAuthenticated(serviceDateRes, cookies);

    if (!serviceDateRes.ok) {
      return fail(500, {
        message: "Falha ao iniciar novo resumo.",
      });
    }
  },
};
