import { AUTH_COOKIE, signToken } from "$lib/auth-server";
import { getUserByEmail } from "$lib/db";
import { loginSchema } from "$lib/validations";
import { json } from "@sveltejs/kit";
import type { RequestEvent } from "@sveltejs/kit";
import bcrypt from "bcryptjs";

export async function POST({ request, cookies }: RequestEvent) {
  try {
    const body: unknown = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return json(
        { error: "Datos inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const user = await getUserByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return json({ error: "Credenciales incorrectas" }, { status: 401 });
    }

    const token = await signToken({
      sub: user.id,
      email: user.email,
      nombre: user.nombre,
      rol: user.rol,
    });

    cookies.set(AUTH_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 8,
      path: "/",
    });

    return json({
      data: {
        user: { id: user.id, email: user.email, nombre: user.nombre, rol: user.rol },
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return json({ error: "Error en el servidor" }, { status: 500 });
  }
}
