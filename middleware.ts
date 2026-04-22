import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "dev-secret-please-change-in-production"
);

const AUTH_COOKIE = "ff_session";

async function verify(token: string | undefined): Promise<{
  rol: "super_admin" | "admin" | "organizador" | "juez";
} | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return { rol: payload.rol as never };
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  const session = await verify(token);

  // Root redirect
  if (pathname === "/") {
    const dest = session ? "/panel" : "/login";
    return NextResponse.redirect(new URL(dest, req.url));
  }

  // /panel/** requires session
  if (pathname.startsWith("/panel")) {
    if (!session) {
      const url = new URL("/login", req.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    // /panel/competiciones/nueva requires super_admin
    if (
      pathname === "/panel/competiciones/nueva" ||
      pathname.startsWith("/panel/competiciones/nueva/")
    ) {
      if (session.rol !== "super_admin") {
        return NextResponse.redirect(new URL("/panel", req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/panel/:path*",
  ],
};
