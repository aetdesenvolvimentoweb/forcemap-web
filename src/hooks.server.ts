import { redirect } from "@sveltejs/kit";
import type { Handle } from "@sveltejs/kit";

const PROTECTED_ROUTES = ["/obm"];

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

  return resolve(event);
};
