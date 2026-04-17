import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
  const accessToken = event.cookies.get("access_token");

  if (!accessToken) {
    event.locals.user = null;
    return resolve(event);
  }

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

  return resolve(event);
};
