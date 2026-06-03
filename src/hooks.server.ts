import { redirect } from "@sveltejs/kit";
import type { Handle } from "@sveltejs/kit";

const PROTECTED_ROUTES = ["/obm"];

// Defesa em profundidade: além da autenticação, restringe por papel as rotas
// que mudam/expõem dados sensíveis. Espelha a matriz imposta pela API. O acesso
// negado redireciona ao painel (a navegação já oculta os itens sem permissão).
const ROLE_PROTECTED_ROUTES: { prefix: string; roles: string[] }[] = [
  { prefix: "/obm/usuarios", roles: ["Admin", "Chefe"] },
  { prefix: "/obm/postos-graduacoes", roles: ["Admin"] },
  { prefix: "/obm/viaturas", roles: ["Admin", "Chefe", "ACA"] },
  { prefix: "/obm/efetivo", roles: ["Admin", "Chefe", "ACA"] },
  { prefix: "/obm/aca", roles: ["Admin", "Chefe", "ACA"] },
  { prefix: "/obm/oficial", roles: ["Admin", "Chefe", "ACA"] },
  { prefix: "/obm/telefonistas", roles: ["Admin", "Chefe", "ACA"] },
  { prefix: "/obm/trocas", roles: ["Admin", "Chefe", "ACA"] },
  { prefix: "/obm/guarnicoes", roles: ["Admin", "Chefe", "ACA"] },
];

function clearAuthCookies(event: Parameters<Handle>[0]["event"]): void {
  event.cookies.delete("access_token", { path: "/" });
  event.cookies.delete("refresh_token", { path: "/" });
}

export const handle: Handle = async ({ event, resolve }) => {
  const accessToken = event.cookies.get("access_token");

  if (!accessToken) {
    event.locals.user = null;
  } else {
    try {
      const payload = JSON.parse(atob(accessToken.split(".")[1]));
      const nowInSeconds = Math.floor(Date.now() / 1000);
      const isExpired =
        typeof payload.exp === "number" && payload.exp <= nowInSeconds;

      if (isExpired) {
        clearAuthCookies(event);
        event.locals.user = null;
      } else {
        event.locals.user = {
          id: payload.userId,
          militaryId: payload.militaryId,
          role: payload.role,
        };
      }
    } catch {
      clearAuthCookies(event);
      event.locals.user = null;
    }
  }

  const isProtected = PROTECTED_ROUTES.some((route) =>
    event.url.pathname.startsWith(route),
  );

  if (isProtected && !event.locals.user) {
    redirect(303, "/login");
  }

  if (event.locals.user) {
    const restricted = ROLE_PROTECTED_ROUTES.find((route) =>
      event.url.pathname.startsWith(route.prefix),
    );

    if (restricted && !restricted.roles.includes(event.locals.user.role)) {
      redirect(303, "/obm");
    }
  }

  return resolve(event);
};
