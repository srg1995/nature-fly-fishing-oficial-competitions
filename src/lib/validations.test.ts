import { describe, expect, it } from "vitest";
import {
  createCatchSchema,
  createParticipanteSchema,
  createUserSchema,
  loginSchema,
} from "./validations";

const uuid = "123e4567-e89b-12d3-a456-426614174000";

describe("createParticipanteSchema", () => {
  it("aplica valores por defecto", () => {
    const r = createParticipanteSchema.parse({ nombre: "Juan" });
    expect(r).toMatchObject({ turno: "A", club: "", plica: "" });
  });

  it("rechaza nombres cortos y turnos inválidos", () => {
    expect(createParticipanteSchema.safeParse({ nombre: "J" }).success).toBe(false);
    expect(
      createParticipanteSchema.safeParse({ nombre: "Juan", turno: "C" }).success
    ).toBe(false);
  });
});

describe("createCatchSchema", () => {
  const base = { pescadorId: uuid, manga: 1, longitudCm: 25 };

  it("acepta una captura mínima válida", () => {
    expect(createCatchSchema.parse(base).valida).toBe(true);
  });

  it("valida longitud, manga, hora y uuid", () => {
    expect(createCatchSchema.safeParse({ ...base, longitudCm: 0 }).success).toBe(false);
    expect(createCatchSchema.safeParse({ ...base, longitudCm: 201 }).success).toBe(false);
    expect(createCatchSchema.safeParse({ ...base, manga: 11 }).success).toBe(false);
    expect(createCatchSchema.safeParse({ ...base, hora: "9:5" }).success).toBe(false);
    expect(createCatchSchema.safeParse({ ...base, hora: "09:05" }).success).toBe(true);
    expect(createCatchSchema.safeParse({ ...base, pescadorId: "x" }).success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("exige email válido y contraseña de 6+ caracteres", () => {
    expect(loginSchema.safeParse({ email: "a@b.es", password: "123456" }).success).toBe(true);
    expect(loginSchema.safeParse({ email: "no", password: "123456" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "a@b.es", password: "123" }).success).toBe(false);
  });
});

describe("createUserSchema", () => {
  it("usa juez como rol por defecto y no permite super_admin", () => {
    const base = { email: "a@b.es", nombre: "Ana", password: "123456" };
    expect(createUserSchema.parse(base).rol).toBe("juez");
    expect(createUserSchema.safeParse({ ...base, rol: "super_admin" }).success).toBe(false);
  });
});
