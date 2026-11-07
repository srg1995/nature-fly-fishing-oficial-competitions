import { AUTH_COOKIE } from "$lib/auth-server";
import { json } from "@sveltejs/kit";
import type { RequestEvent } from "@sveltejs/kit";

export async function POST({ cookies }: RequestEvent) {
  cookies.delete(AUTH_COOKIE, { path: "/" });
  return json({ message: "Sesión cerrada" });
}
