import { AUTH_COOKIE, verifyToken } from "$lib/auth-server";
import { redirect, type Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get(AUTH_COOKIE);
  event.locals.session = token ? await verifyToken(token) : null;

  const path = event.url.pathname;
  const isPanelPath = path.startsWith("/panel");
  const isLoginPath = path === "/login";

  if (path === "/") {
    throw redirect(302, event.locals.session ? "/panel" : "/login");
  }

  if (isPanelPath && !event.locals.session) {
    throw redirect(302, `/login?next=${encodeURIComponent(path)}`);
  }

  if (isLoginPath && event.locals.session) {
    throw redirect(302, "/panel");
  }

  if (
    event.locals.session &&
    (path === "/panel/competiciones/nueva" ||
      path.startsWith("/panel/competiciones/nueva/")) &&
    event.locals.session.rol !== "super_admin"
  ) {
    throw redirect(302, "/panel");
  }

  return resolve(event);
};
