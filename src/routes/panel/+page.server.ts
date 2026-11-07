import { getAuditLog } from "$lib/db";
import { listCompetitions } from "$lib/queries/competitions";
import { getGlobalPanelStats } from "$lib/queries/global-stats";
import { redirect } from "@sveltejs/kit";

export const load = async ({ locals }) => {
  const session = locals.session;
  if (!session) {
    throw redirect(302, "/login");
  }

  if (session.rol !== "super_admin") {
    const all = await listCompetitions();
    if (all.length > 0) {
      throw redirect(302, `/panel/competiciones/${all[0].id}`);
    }
    return { session, empty: true as const };
  }

  const [stats, competitions, audit] = await Promise.all([
    getGlobalPanelStats(),
    listCompetitions(),
    getAuditLog(null, 15),
  ]);

  return {
    session,
    empty: false as const,
    stats,
    competitions: competitions.slice(0, 6),
    audit,
  };
};
