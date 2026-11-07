import { HttpError, requireAnySession, toJsonResponse } from "$lib/auth-competition";
import type { JwtPayload } from "$lib/auth-server";
import { createUser, getUsers } from "$lib/db";
import { createUserSchema } from "$lib/validations";
import bcrypt from "bcryptjs";
import type { RequestHandler } from "./$types";

function requireUserAdmin(session: JwtPayload | null): JwtPayload {
  const safe = requireAnySession(session);
  if (safe.rol !== "admin" && safe.rol !== "super_admin") {
    throw new HttpError(403, "Permisos insuficientes");
  }
  return safe;
}

export const GET: RequestHandler = async ({ locals }) => {
  try {
    requireUserAdmin(locals.session);
    return Response.json({ data: await getUsers() });
  } catch (error) {
    return toJsonResponse(error);
  }
};

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    requireUserAdmin(locals.session);
    const parsed = createUserSchema.safeParse(await request.json());
    if (!parsed.success) {
      return Response.json(
        { error: "Datos inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const user = await createUser({
      email: parsed.data.email,
      nombre: parsed.data.nombre,
      passwordHash: await bcrypt.hash(parsed.data.password, 12),
      rol: parsed.data.rol,
    });
    return Response.json({ data: user }, { status: 201 });
  } catch (error) {
    return toJsonResponse(error);
  }
};
