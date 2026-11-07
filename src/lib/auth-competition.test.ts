import { beforeEach, describe, expect, it, vi } from "vitest";
import type { JwtPayload } from "./auth-server";

const rows: unknown[] = [];

vi.mock("@/db", () => ({
  db: {
    select: () => ({
      from: () => ({ where: () => ({ limit: async () => rows }) }),
    }),
  },
}));
vi.mock("@/db/schema", () => ({ competitions: { id: "id" } }));
vi.mock("drizzle-orm", () => ({ eq: () => ({}) }));

const {
  HttpError,
  requireAnySession,
  requireCompetitionRole,
  requireSuperAdmin,
  toJsonResponse,
} = await import("./auth-competition");

function session(rol: JwtPayload["rol"]): JwtPayload {
  return { sub: "u", email: "a@b.es", nombre: "A", rol, iat: 1, exp: 2 };
}

beforeEach(() => {
  rows.length = 0;
});

describe("toJsonResponse", () => {
  it("traduce HttpError a su estado", async () => {
    const res = toJsonResponse(new HttpError(403, "No"));
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: "No" });
  });

  it("devuelve 500 genérico para errores desconocidos", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const res = toJsonResponse(new Error("secreto interno"));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Error interno" });
  });
});

describe("requireSuperAdmin / requireAnySession", () => {
  it("401 sin sesión", () => {
    expect(() => requireSuperAdmin(null)).toThrowError(/No autorizado/);
    expect(() => requireAnySession(null)).toThrowError(/No autorizado/);
  });

  it("403 si no es super_admin", () => {
    expect(() => requireSuperAdmin(session("admin"))).toThrowError(/super_admin/);
    expect(requireSuperAdmin(session("super_admin")).rol).toBe("super_admin");
  });
});

describe("requireCompetitionRole", () => {
  it("401 sin sesión", async () => {
    await expect(requireCompetitionRole(null, "c1")).rejects.toMatchObject({ status: 401 });
  });

  it("404 si la competición no existe", async () => {
    await expect(requireCompetitionRole(session("admin"), "c1")).rejects.toMatchObject({
      status: 404,
    });
  });

  it("403 si el rol no está permitido", async () => {
    rows.push({ id: "c1" });
    await expect(
      requireCompetitionRole(session("juez"), "c1", "admin")
    ).rejects.toMatchObject({ status: 403 });
  });

  it("permite roles autorizados y siempre al super_admin", async () => {
    rows.push({ id: "c1" });
    const ok = await requireCompetitionRole(session("admin"), "c1", "admin");
    expect(ok.competition).toEqual({ id: "c1" });
    const sa = await requireCompetitionRole(session("super_admin"), "c1", "admin");
    expect(sa.session.rol).toBe("super_admin");
  });
});
