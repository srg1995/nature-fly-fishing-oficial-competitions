import * as XLSX from "xlsx";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { DuoStats, CatchRecord, MangaStats } from "@/types";

interface CatchWithDuo extends CatchRecord {
  nombreDuo: string;
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
  clasificacion: DuoStats[],
  mangaStats: MangaStats[],
  capturas: CatchWithDuo[]
): Blob {
  const wb = XLSX.utils.book_new();

  // ── Hoja 1: Clasificación General ─────────────────────────────────────────
  const clasificacionHeaders = [
    "Posición", "Dúo", "Pescador 1", "Pescador 2", "Plica",
    "Tramo", "Río", "Capturas Válidas", "< 18 cm", "Total cm", "Puntos Totales",
  ];
  const clasificacionData = clasificacion.map((d) => [
    String(d.posicion ?? ""),
    d.nombreDuo,
    d.pescador1,
    d.pescador2,
    d.plica,
    d.tramo,
    d.rio,
    String(d.capturasValidas),
    String(d.capturasMenores18),
    d.totalCm.toFixed(1),
    String(d.totalPuntos),
  ]);

  const ws1Data = [clasificacionHeaders, ...clasificacionData];
  const ws1 = XLSX.utils.aoa_to_sheet(ws1Data);
  autoFitColumns(ws1, ws1Data);
  ws1["!autofilter"] = { ref: `A1:K${ws1Data.length}` };
  applyHeaderStyle(ws1, 0, clasificacionHeaders.length);
  XLSX.utils.book_append_sheet(wb, ws1, "Clasificación General");

  // ── Hoja 2: Resultados por Manga ───────────────────────────────────────────
  const mangaHeaders = [
    "Manga", "Dúos Participantes", "Total Capturas", "Capturas Válidas", "Total Puntos",
  ];
  const mangaData = mangaStats.map((m) => [
    `Manga ${m.manga}`,
    String(m.duosParticipantes),
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
    "ID", "Dúo", "Manga", "Tramo", "Río",
    "Longitud (cm)", "Puntos", "Válida", "Hora", "Observaciones", "Fecha Registro",
  ];
  const capturaData = capturas.map((c) => [
    c.id.substring(0, 8),
    c.nombreDuo,
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
  const totalPuntos = clasificacion.reduce((s, d) => s + d.totalPuntos, 0);
  const totalCapturas = clasificacion.reduce((s, d) => s + d.totalCapturas, 0);
  const mejorPieza = Math.max(...clasificacion.map((d) => d.mejorPieza), 0);
  const mejorDuo = clasificacion[0];

  const statsData = [
    ["Estadísticas del Campeonato", ""],
    ["Fecha de exportación", format(new Date(), "dd/MM/yyyy HH:mm", { locale: es })],
    ["", ""],
    ["Total de dúos participantes", String(clasificacion.length)],
    ["Total de capturas válidas", String(totalCapturas)],
    ["Total de puntos acumulados", String(totalPuntos)],
    ["Mejor pieza (cm)", String(mejorPieza)],
    ["", ""],
    ["Dúo líder", mejorDuo?.nombreDuo ?? "N/A"],
    ["Puntos del líder", String(mejorDuo?.totalPuntos ?? 0)],
    ["Capturas válidas del líder", String(mejorDuo?.capturasValidas ?? 0)],
  ];

  const ws4 = XLSX.utils.aoa_to_sheet(statsData);
  ws4["!cols"] = [{ wch: 35 }, { wch: 25 }];
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

export interface ImportedDuoRow {
  nombreDuo: string;
  pescador1: string;
  pescador2: string;
  plica: string;
  tramo: string;
  rio: string;
}

export function parseDuosFromExcel(buffer: ArrayBuffer): ImportedDuoRow[] {
  const wb = XLSX.read(buffer, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  if (!ws) throw new Error("El archivo Excel no contiene hojas");

  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws, {
    header: 0,
    defval: "",
  });

  return rows.map((row) => ({
    nombreDuo: String(row["Nombre Dúo"] ?? row["nombreDuo"] ?? "").trim(),
    pescador1: String(row["Pescador 1"] ?? row["pescador1"] ?? "").trim(),
    pescador2: String(row["Pescador 2"] ?? row["pescador2"] ?? "").trim(),
    plica: String(row["Plica"] ?? row["plica"] ?? "").trim(),
    tramo: String(row["Tramo"] ?? row["tramo"] ?? "").trim(),
    rio: String(row["Río"] ?? row["Rio"] ?? row["rio"] ?? "").trim(),
  }));
}
