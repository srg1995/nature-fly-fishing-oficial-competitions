import { sql } from "@vercel/postgres";

export interface GlobalPanelStats {
  totalCompeticiones: number;
  enCurso: number;
  finalizadas: number;
  pescadoresUnicos: number;
  capturasUltimas24h: number;
}

export async function getGlobalPanelStats(): Promise<GlobalPanelStats> {
  const [totals, pescadores, capturas24h] = await Promise.all([
    sql`
      SELECT
        COUNT(*)::int                                                  AS total,
        COUNT(*) FILTER (WHERE estado = 'en_curso')::int               AS en_curso,
        COUNT(*) FILTER (WHERE estado = 'finalizada')::int             AS finalizadas
      FROM competitions
    `,
    sql`SELECT COUNT(DISTINCT plica)::int AS count FROM participantes`,
    sql`
      SELECT COUNT(*)::int AS count
      FROM catch_records
      WHERE created_at >= NOW() - INTERVAL '24 hours'
    `,
  ]);

  return {
    totalCompeticiones: totals.rows[0].total as number,
    enCurso: totals.rows[0].en_curso as number,
    finalizadas: totals.rows[0].finalizadas as number,
    pescadoresUnicos: pescadores.rows[0].count as number,
    capturasUltimas24h: capturas24h.rows[0].count as number,
  };
}
