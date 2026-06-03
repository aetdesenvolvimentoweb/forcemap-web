import { getApiUrl, internalHeaders } from "$lib/server/api";
import type {
  ACA,
  Garrison,
  Officer,
  ServiceSwap,
  Telephonist,
  Vehicle,
} from "$lib/types";
import { currentServiceDate } from "$lib/utils/datetime";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, platform }) => {
  // Usuários autenticados vão direto ao painel interno.
  if (locals.user) {
    redirect(303, "/obm");
  }

  const apiUrl = getApiUrl(platform);
  const headers = internalHeaders(platform);

  // Leitura pública e tolerante a falhas: se a API estiver indisponível ou
  // ainda sem dados, a home apenas exibe o resumo vazio.
  const safeList = async <T>(path: string): Promise<T[]> => {
    try {
      const res = await fetch(`${apiUrl}/public/${path}`, { headers });
      if (!res.ok) return [];
      const { data } = await res.json();
      return (data ?? []) as T[];
    } catch {
      return [];
    }
  };

  const [vehicles, officers, acas, telephonists, garrisons, serviceSwaps] =
    await Promise.all([
      safeList<Vehicle>("vehicle"),
      safeList<Officer>("officer"),
      safeList<ACA>("aca"),
      safeList<Telephonist>("telephonist"),
      safeList<Garrison>("garrison"),
      safeList<ServiceSwap>("service-swap"),
    ]);

  let serviceDate = currentServiceDate();
  try {
    const res = await fetch(`${apiUrl}/public/service-date`, { headers });
    if (res.ok) {
      const { data } = await res.json();
      if (data?.date) serviceDate = data.date;
    }
  } catch {
    // mantém o fallback (data de hoje)
  }

  return {
    vehicles,
    officers,
    acas,
    telephonists,
    garrisons,
    serviceSwaps,
    serviceDate,
  };
};
