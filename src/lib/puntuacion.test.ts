import { describe, expect, it } from "vitest";
import {
  calcularPuntos,
  calcularTotalPuntos,
  describePuntuacion,
  esTallaMinima,
  resolverEmpate,
} from "./puntuacion";

describe("puntuacion", () => {
  it("da 15 puntos fijos por debajo de 19 cm", () => {
    expect(calcularPuntos(18)).toBe(15);
  });

  it("calcula 100 + longitud × 20 desde 19 cm", () => {
    expect(calcularPuntos(19)).toBe(480);
    expect(calcularPuntos(30)).toBe(700);
  });

  it("detecta la talla mínima", () => {
    expect(esTallaMinima(19)).toBe(true);
    expect(esTallaMinima(18)).toBe(false);
  });

  it("describe el cálculo", () => {
    expect(describePuntuacion(10)).toContain("15 pts");
    expect(describePuntuacion(20)).toContain("= 500 pts");
  });

  it("suma solo capturas válidas", () => {
    expect(
      calcularTotalPuntos([
        { longitudCm: 20, valida: true },
        { longitudCm: 25, valida: false },
        { longitudCm: 10, valida: true },
      ])
    ).toBe(515);
  });

  it("resuelve empates por capturas y luego por mejor pieza", () => {
    expect(
      resolverEmpate(
        { capturasValidas: 2, mejorPieza: 20 },
        { capturasValidas: 3, mejorPieza: 10 }
      )
    ).toBeGreaterThan(0);
    expect(
      resolverEmpate(
        { capturasValidas: 2, mejorPieza: 20 },
        { capturasValidas: 2, mejorPieza: 25 }
      )
    ).toBeGreaterThan(0);
  });
});
