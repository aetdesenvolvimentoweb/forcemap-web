import { redirect } from "@sveltejs/kit";
import type { Handle } from "@sveltejs/kit";

const PROTECTED_ROUTES = ["/dashboard"];

export const handle: Handle = async ({ event, resolve }) => {
  const accessToken = event.cookies.get("access_token");

  if (!accessToken) {
    event.locals.user = null;
  } else {
    try {
      const payload = JSON.parse(atob(accessToken.split(".")[1]));
      event.locals.user = {
        id: payload.userId,
        militaryId: payload.militaryId,
        role: payload.role,
      };
    } catch {
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
