import { describe, expect, it } from "vitest";
import {
  cn,
  formatDate,
  formatDateShort,
  formatLongitud,
  formatPuntos,
  formatTime,
  getInitials,
  truncate,
} from "./utils";

describe("utils", () => {
  it("cn fusiona clases de tailwind", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("formatea fechas", () => {
    expect(formatDate("2026-03-05T10:30:00")).toBe("05/03/2026 10:30");
    expect(formatDateShort("2026-03-05T10:30:00")).toBe("05/03/2026");
  });

  it("formatTime recorta segundos y gestiona null", () => {
    expect(formatTime("09:15:00")).toBe("09:15");
    expect(formatTime(null)).toBe("—");
  });

  it("formatea puntos y longitud", () => {
    expect(formatPuntos(1500)).toBe(Number(1500).toLocaleString("es-ES"));
    expect(formatLongitud(21)).toBe("21 cm");
  });

  it("getInitials devuelve máximo dos letras", () => {
    expect(getInitials("juan pérez gómez")).toBe("JP");
  });

  it("truncate añade elipsis solo si hace falta", () => {
    expect(truncate("abc", 5)).toBe("abc");
    expect(truncate("abcdef", 3)).toBe("abc…");
  });
});
