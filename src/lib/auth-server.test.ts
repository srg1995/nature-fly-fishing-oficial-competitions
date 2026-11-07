import { SignJWT } from "jose";
import { describe, expect, it } from "vitest";
import { signToken, verifyToken } from "./auth-server";

const user = { sub: "u1", email: "a@b.es", nombre: "Ana", rol: "juez" as const };

describe("auth-server", () => {
  it("firma y verifica un token", async () => {
    const payload = await verifyToken(await signToken(user));
    expect(payload).toMatchObject(user);
    expect(payload!.exp).toBeGreaterThan(payload!.iat);
  });

  it("rechaza tokens manipulados o basura", async () => {
    const token = await signToken(user);
    expect(await verifyToken(token.slice(0, -2) + "xx")).toBeNull();
    expect(await verifyToken("no-es-un-jwt")).toBeNull();
  });

  it("rechaza tokens firmados con otra clave", async () => {
    const forged = await new SignJWT({ ...user })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(new TextEncoder().encode("otra-clave"));
    expect(await verifyToken(forged)).toBeNull();
  });

  it("rechaza tokens sin los campos requeridos", async () => {
    const incomplete = await new SignJWT({ email: "a@b.es" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(new TextEncoder().encode("dev-secret-please-change-in-production"));
    expect(await verifyToken(incomplete)).toBeNull();
  });
});
