import { SignJWT, jwtVerify } from "jose";
import type { UserRole } from "@/types";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "dev-secret-please-change-in-production"
);

export const AUTH_COOKIE = "ff_session";

export interface JwtPayload {
  sub: string;
  email: string;
  nombre: string;
  rol: UserRole;
  iat: number;
  exp: number;
}

export async function signToken(payload: {
  sub: string;
  email: string;
  nombre: string;
  rol: UserRole;
}): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.nombre !== "string" ||
      typeof payload.rol !== "string" ||
      typeof payload.iat !== "number" ||
      typeof payload.exp !== "number"
    ) {
      return null;
    }

    return {
      sub: payload.sub,
      email: payload.email,
      nombre: payload.nombre,
      rol: payload.rol as UserRole,
      iat: payload.iat,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}
