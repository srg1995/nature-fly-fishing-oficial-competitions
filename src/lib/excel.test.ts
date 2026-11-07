import * as XLSX from "xlsx";
import { describe, expect, it } from "vitest";
import type { CatchRecord, MangaStats, PescadorStats } from "@/types";
import {
  generarExcelResultados,
  getExcelFilename,
  parseParticipantesFromExcel,
} from "./excel";

function buffer(rows: Record<string, string>[]): ArrayBuffer {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Participantes");
  return XLSX.write(wb, { type: "array", bookType: "xlsx" });
}

describe("parseParticipantesFromExcel", () => {
  it("lee columnas con cabeceras en mayúscula o minúscula y recorta espacios", () => {
    const conMayusculas = parseParticipantesFromExcel(
      buffer([{ Nombre: " Juan ", Plica: "7", Club: "Club A", Tramo: "T1", Río: "Esla" }])
    );
    expect(conMayusculas[0]).toEqual({
      nombre: "Juan",
      plica: "7",
      club: "Club A",
      tramo: "T1",
      rio: "Esla",
    });

    const conMinusculas = parseParticipantesFromExcel(
      buffer([{ nombre: "Ana", rio: "Tera" }])
    );
    expect(conMinusculas[0]).toMatchObject({ nombre: "Ana", rio: "Tera", club: "" });
  });
});

describe("getExcelFilename", () => {
  it("incluye la fecha en formato ISO", () => {
    expect(getExcelFilename()).toMatch(/^clasificacion-campeonato-salmonidos-\d{4}-\d{2}-\d{2}\.xlsx$/);
  });
});

describe("generarExcelResultados", () => {
  const pescador: PescadorStats = {
    pescadorId: "p1",
    nombre: "Juan",
    plica: "7",
    club: "Club A",
    turno: "A",
    tramo: "T1",
    rio: "Esla",
    totalCapturas: 2,
    capturasValidas: 1,
    capturasMenores19: 1,
    totalCm: 40,
    totalPuntos: 515,
    mejorPieza: 25,
    posicion: 1,
  };
  const manga: MangaStats = {
    manga: 1,
    dia: 1,
    sesion: "mañana",
    turno: "A",
    totalCapturas: 2,
    capturasValidas: 1,
    totalPuntos: 515,
    pescadoresParticipantes: 1,
  };
  const captura: CatchRecord & { nombre: string } = {
    id: "12345678-aaaa",
    nombre: "Juan",
    pescadorId: "p1",
    sessionId: null,
    manga: 1,
    tramo: "T1",
    rio: "Esla",
    longitudCm: 25,
    puntos: 600,
    valida: true,
    hora: null,
    observaciones: "",
    juezId: null,
    createdAt: new Date("2026-05-01T10:00:00"),
    updatedAt: new Date("2026-05-01T10:00:00"),
  };

  it("genera un libro con las cuatro hojas y los datos", async () => {
    const blob = generarExcelResultados([pescador], [manga], [captura]);
    const wb = XLSX.read(await blob.arrayBuffer(), { type: "array" });
    expect(wb.SheetNames).toEqual([
      "Clasificación General",
      "Resultados por Manga",
      "Capturas Detalladas",
      "Estadísticas",
    ]);
    const clasificacion = XLSX.utils.sheet_to_json<string[]>(wb.Sheets["Clasificación General"], {
      header: 1,
    });
    expect(clasificacion[3]?.[1]).toBe("Juan");
  });

  it("no falla sin participantes", () => {
    expect(() => generarExcelResultados([], [], [])).not.toThrow();
  });
});
