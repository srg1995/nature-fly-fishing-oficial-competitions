import * as XLSX from "xlsx";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { PescadorStats, CatchRecord, MangaStats } from "@/types";

interface CatchWithPescador extends CatchRecord {
  nombre: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function autoFitColumns(ws: XLSX.WorkSheet, data: string[][]): void {
  const colWidths = data[0]?.map((_, colIndex) => {
    return Math.max(
      ...data.map((row) => (row[colIndex] ?? "").toString().length),
      10
    );
  });
  ws["!cols"] = colWidths?.map((w) => ({ wch: Math.min(w + 2, 50) }));
}

function applyHeaderStyle(ws: XLSX.WorkSheet, headerRow: number, colCount: number): void {
  for (let col = 0; col < colCount; col++) {
    const cellRef = XLSX.utils.encode_cell({ r: headerRow, c: col });
    if (!ws[cellRef]) continue;
    ws[cellRef].s = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "0369A1" } },
      alignment: { horizontal: "center" },
    };
  }
}

// ─── Export ───────────────────────────────────────────────────────────────────

export function generarExcelResultados(
  clasificacion: PescadorStats[],
  mangaStats: MangaStats[],
  capturas: CatchWithPescador[]
): Blob {
  const wb = XLSX.utils.book_new();

  // ── Hoja 1: Clasificación General ─────────────────────────────────────────
  const clasificacionHeaders = [
    "Posición", "Pescador", "Club", "Plica",
    "Tramo", "Río", "Capturas Válidas", "< 18 cm", "Total cm", "Mejor Pieza", "Puntos Totales",
  ];
  const clasificacionData = clasificacion.map((p) => [
    String(p.posicion ?? ""),
    p.nombre,
    p.club,
    p.plica,
    p.tramo,
    p.rio,
    String(p.capturasValidas),
    String(p.capturasMenores18),
    p.totalCm.toFixed(1),
    `${p.mejorPieza} cm`,
    String(p.totalPuntos),
  ]);

  const ws1Data = [clasificacionHeaders, ...clasificacionData];
  const ws1 = XLSX.utils.aoa_to_sheet(ws1Data);
  autoFitColumns(ws1, ws1Data);
  ws1["!autofilter"] = { ref: `A1:K${ws1Data.length}` };
  applyHeaderStyle(ws1, 0, clasificacionHeaders.length);
  XLSX.utils.book_append_sheet(wb, ws1, "Clasificación General");

  // ── Hoja 2: Resultados por Manga ───────────────────────────────────────────
  const mangaHeaders = [
    "Manga", "Pescadores Participantes", "Total Capturas", "Capturas Válidas", "Total Puntos",
  ];
  const mangaData = mangaStats.map((m) => [
    `Manga ${m.manga}`,
    String(m.pescadoresParticipantes),
    String(m.totalCapturas),
    String(m.capturasValidas),
    String(m.totalPuntos),
  ]);

  const ws2Data = [mangaHeaders, ...mangaData];
  const ws2 = XLSX.utils.aoa_to_sheet(ws2Data);
  autoFitColumns(ws2, ws2Data);
  applyHeaderStyle(ws2, 0, mangaHeaders.length);
  XLSX.utils.book_append_sheet(wb, ws2, "Resultados por Manga");

  // ── Hoja 3: Capturas Detalladas ────────────────────────────────────────────
  const capturaHeaders = [
    "ID", "Pescador", "Manga", "Tramo", "Río",
    "Longitud (cm)", "Puntos", "Válida", "Hora", "Observaciones", "Fecha Registro",
  ];
  const capturaData = capturas.map((c) => [
    c.id.substring(0, 8),
    c.nombre,
    String(c.manga),
    c.tramo,
    c.rio,
    String(c.longitudCm),
    String(c.puntos),
    c.valida ? "Sí" : "No",
    c.hora ?? "",
    c.observaciones,
    c.createdAt ? format(new Date(c.createdAt), "dd/MM/yyyy HH:mm", { locale: es }) : "",
  ]);

  const ws3Data = [capturaHeaders, ...capturaData];
  const ws3 = XLSX.utils.aoa_to_sheet(ws3Data);
  autoFitColumns(ws3, ws3Data);
  ws3["!autofilter"] = { ref: `A1:K${ws3Data.length}` };
  applyHeaderStyle(ws3, 0, capturaHeaders.length);
  XLSX.utils.book_append_sheet(wb, ws3, "Capturas Detalladas");

  // ── Hoja 4: Estadísticas ───────────────────────────────────────────────────
  const totalPuntos = clasificacion.reduce((s, p) => s + p.totalPuntos, 0);
  const totalCapturas = clasificacion.reduce((s, p) => s + p.totalCapturas, 0);
  const mejorPieza = Math.max(...clasificacion.map((p) => p.mejorPieza), 0);
  const lider = clasificacion[0];

  const statsData = [
    ["Estadísticas del Campeonato", ""],
    ["Fecha de exportación", format(new Date(), "dd/MM/yyyy HH:mm", { locale: es })],
    ["", ""],
    ["Total de pescadores participantes", String(clasificacion.length)],
    ["Total de capturas válidas", String(totalCapturas)],
    ["Total de puntos acumulados", String(totalPuntos)],
    ["Mejor pieza (cm)", String(mejorPieza)],
    ["", ""],
    ["Líder", lider?.nombre ?? "N/A"],
    ["Club del líder", lider?.club ?? "N/A"],
    ["Puntos del líder", String(lider?.totalPuntos ?? 0)],
    ["Capturas válidas del líder", String(lider?.capturasValidas ?? 0)],
  ];

  const ws4 = XLSX.utils.aoa_to_sheet(statsData);
  ws4["!cols"] = [{ wch: 38 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(wb, ws4, "Estadísticas");

  // ── Generar buffer ─────────────────────────────────────────────────────────
  const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  return new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

// ─── Filename ─────────────────────────────────────────────────────────────────

export function getExcelFilename(): string {
  const fecha = format(new Date(), "yyyy-MM-dd");
  return `clasificacion-campeonato-salmonidos-${fecha}.xlsx`;
}

// ─── Import from Excel ────────────────────────────────────────────────────────

export interface ImportedParticipanteRow {
  nombre: string;
  plica: string;
  club: string;
  tramo: string;
  rio: string;
}

export function parseParticipantesFromExcel(buffer: ArrayBuffer): ImportedParticipanteRow[] {
  const wb = XLSX.read(buffer, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  if (!ws) throw new Error("El archivo Excel no contiene hojas");

  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws, {
    header: 0,
    defval: "",
  });

  return rows.map((row) => ({
    nombre: String(row["Nombre"] ?? row["nombre"] ?? "").trim(),
    plica: String(row["Plica"] ?? row["plica"] ?? "").trim(),
    club: String(row["Club"] ?? row["club"] ?? "").trim(),
    tramo: String(row["Tramo"] ?? row["tramo"] ?? "").trim(),
    rio: String(row["Río"] ?? row["Rio"] ?? row["rio"] ?? "").trim(),
  }));
}
