import type { RequestEvent } from "@sveltejs/kit";
import { describe, expect, it } from "vitest";
import { AUTH_COOKIE, signToken } from "$lib/auth-server";
import { handle } from "./hooks.server";

type Rol = "super_admin" | "admin" | "juez";

async function run(path: string, rol?: Rol) {
  const token = rol
    ? await signToken({ sub: "u", email: "a@b.es", nombre: "A", rol })
    : undefined;
  const event = {
    url: new URL(`http://localhost${path}`),
    cookies: { get: (n: string) => (n === AUTH_COOKIE ? token : undefined) },
    locals: {},
  } as unknown as RequestEvent;
  try {
    const res = await handle({
      event,
      resolve: async () => new Response("ok"),
    });
    return { status: res.status, location: null as string | null };
  } catch (e) {
    const r = e as { status: number; location: string };
    return { status: r.status, location: r.location };
  }
}

describe("hooks.server handle", () => {
  it("redirige / según haya sesión", async () => {
    expect(await run("/")).toEqual({ status: 302, location: "/login" });
    expect(await run("/", "juez")).toEqual({ status: 302, location: "/panel" });
  });

  it("protege /panel sin sesión conservando el destino", async () => {
    expect(await run("/panel/competiciones")).toEqual({
      status: 302,
      location: "/login?next=%2Fpanel%2Fcompeticiones",
    });
  });

  it("no deja volver a /login con sesión", async () => {
    expect(await run("/login", "juez")).toEqual({ status: 302, location: "/panel" });
  });

  it("solo super_admin accede a nueva competición", async () => {
    expect(await run("/panel/competiciones/nueva", "admin")).toEqual({
      status: 302,
      location: "/panel",
    });
    expect((await run("/panel/competiciones/nueva", "super_admin")).status).toBe(200);
  });

  it("deja pasar rutas públicas", async () => {
    expect((await run("/competiciones")).status).toBe(200);
  });
});
