import { describe, expect, it } from "vitest";
import {
  createCompetitionSchema,
  generateSlug,
  updateCompetitionSchema,
} from "./validations-competition";

const base = {
  nombre: "Campeonato Nacional",
  slug: "campeonato-nacional",
  fechaInicio: "2026-05-01",
  fechaFin: "2026-05-03",
};

describe("createCompetitionSchema", () => {
  it("acepta una competición nacional sin territorio", () => {
    const r = createCompetitionSchema.parse({ ...base, nivel: "nacional" });
    expect(r.totalMangas).toBe(4);
    expect(r.estado).toBe("borrador");
  });

  it("exige comunidad en autonómica y provincia en provincial", () => {
    expect(createCompetitionSchema.safeParse({ ...base, nivel: "autonomica" }).success).toBe(false);
    expect(
      createCompetitionSchema.safeParse({ ...base, nivel: "autonomica", comunidadAutonomaId: 3 }).success
    ).toBe(true);
    expect(
      createCompetitionSchema.safeParse({ ...base, nivel: "provincial", comunidadAutonomaId: 3 }).success
    ).toBe(false);
    expect(
      createCompetitionSchema.safeParse({
        ...base,
        nivel: "provincial",
        comunidadAutonomaId: 3,
        provinciaId: 7,
      }).success
    ).toBe(true);
  });

  it("rechaza fecha fin anterior al inicio", () => {
    const r = createCompetitionSchema.safeParse({
      ...base,
      nivel: "nacional",
      fechaFin: "2026-04-01",
    });
    expect(r.success).toBe(false);
  });

  it("rechaza slugs inválidos", () => {
    expect(
      createCompetitionSchema.safeParse({ ...base, nivel: "nacional", slug: "Mal Slug" }).success
    ).toBe(false);
  });
});

describe("updateCompetitionSchema", () => {
  it("permite actualizaciones parciales", () => {
    expect(updateCompetitionSchema.safeParse({ estado: "en_curso" }).success).toBe(true);
    expect(updateCompetitionSchema.safeParse({ estado: "otro" }).success).toBe(false);
  });
});

describe("generateSlug", () => {
  it("normaliza acentos y símbolos", () => {
    expect(generateSlug("Campeonato Nacional Salmónidos", "VI")).toBe(
      "campeonato-nacional-salmonidos-vi"
    );
  });

  it("devuelve un valor por defecto si queda vacío", () => {
    expect(generateSlug("¡¡¡")).toBe("competicion");
  });
});
