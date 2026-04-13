import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
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
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<JwtPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireSession(): Promise<JwtPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error("No autorizado");
  }
  return session;
}

export function requireRole(session: JwtPayload, ...roles: UserRole[]): void {
  if (!roles.includes(session.rol)) {
    throw new Error("Permisos insuficientes");
  }
}
