import { getAuditLog, getUsers } from "$lib/db";
import { redirect } from "@sveltejs/kit";

export const load = async ({ params, locals }) => {
  if (!locals.session) throw redirect(302, "/login");

  if (!["admin", "organizador", "super_admin"].includes(locals.session.rol)) {
    throw redirect(302, `/panel/competiciones/${params.competitionId}`);
  }

  const [users, audit] = await Promise.all([
    getUsers(),
    getAuditLog(params.competitionId, 100),
  ]);

  return { users, audit };
};
