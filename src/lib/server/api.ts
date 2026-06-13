import { redirect, type Cookies } from "@sveltejs/kit";

export const getApiUrl = (platform: App.Platform | undefined): string => {
  const base = (platform?.env?.API_URL ?? "http://localhost:3333").replace(/\/+$/, "");
  return `${base}/api/v1`;
};

export const isProd = (platform: App.Platform | undefined): boolean => {
  return !!platform?.env?.API_URL;
};

export const internalHeaders = (
  platform: App.Platform | undefined,
): Record<string, string> => {
  const secret = platform?.env?.API_SECRET;
  return secret ? { "X-Internal-Secret": secret } : {};
};

/**
 * Quando a API responde 401 a sessão é considerada expirada/revogada:
 * limpa os cookies de auth e redireciona para o login.
 */
export const ensureAuthenticated = (
  response: Response,
  cookies: Cookies,
): void => {
  if (response.status !== 401) return;

  cookies.delete("access_token", { path: "/" });
  cookies.delete("refresh_token", { path: "/" });
  redirect(303, "/login");
};

/**
 * Lê com segurança a propriedade `data` (lista) de uma resposta da API.
 * Tolera respostas não-OK (ex.: 403) e corpos inválidos, evitando que um
 * `load` quebre com erro 500 — devolve uma lista vazia nesses casos.
 */
export const readList = async <T>(response: Response): Promise<T[]> => {
  if (!response.ok) return [];
  const body = await response.json().catch(() => null);
  return (body?.data ?? []) as T[];
};

/**
 * Codifica um valor para uso seguro como segmento de caminho na URL da API,
 * evitando que IDs maliciosos (ex.: contendo "/" ou "..") remontem a rota.
 */
export const pathSegment = (value: FormDataEntryValue | null): string => {
  return encodeURIComponent(String(value ?? ""));
};

/**
 * Calcula quantos segundos faltam até a expiração de um JWT (claim `exp`),
 * para manter o `maxAge` do cookie em sincronia com o tempo de vida real do
 * token. Retorna `fallback` quando o token é inválido ou já expirou.
 */
export const jwtSecondsUntilExpiry = (
  token: string | undefined,
  fallback: number,
): number => {
  if (!token) return fallback;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (typeof payload.exp !== "number") return fallback;
    const seconds = payload.exp - Math.floor(Date.now() / 1000);
    return seconds > 0 ? seconds : fallback;
  } catch {
    return fallback;
  }
};
