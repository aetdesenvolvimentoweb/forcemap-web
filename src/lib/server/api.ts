import { redirect, type Cookies } from "@sveltejs/kit";

export const getApiUrl = (platform: App.Platform | undefined): string => {
  const base = platform?.env?.API_URL ?? "http://localhost:3333";
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
