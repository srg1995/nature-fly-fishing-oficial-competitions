import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { PescadorStats } from "@/types";

export function generarPDFClasificacion(clasificacion: PescadorStats[]): void {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  // Header
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("VI Campeonato Nacional de Salmónidos Lance Mosca", 148, 20, { align: "center" });

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Clasificación Individual — Modalidad Captura y Suelta Absoluta", 148, 28, { align: "center" });

  doc.setFontSize(10);
  doc.text(
    `Generado el ${format(new Date(), "dd/MM/yyyy 'a las' HH:mm", { locale: es })}`,
    148,
    34,
    { align: "center" }
  );

  autoTable(doc, {
    startY: 42,
    head: [
      ["Pos.", "Pescador", "Club", "Plica", "Tramo", "Cap. Válidas", "< 18cm", "Total cm", "Mejor Pieza", "Puntos"],
    ],
    body: clasificacion.map((p) => [
      String(p.posicion ?? ""),
      p.nombre,
      p.club,
      p.plica,
      p.tramo,
      String(p.capturasValidas),
      String(p.capturasMenores18),
      p.totalCm.toFixed(1),
      `${p.mejorPieza} cm`,
      String(p.totalPuntos),
    ]),
    headStyles: {
      fillColor: [3, 105, 161],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: [240, 249, 255] },
    columnStyles: {
      0: { halign: "center", cellWidth: 10 },
      1: { cellWidth: 45 },
      2: { cellWidth: 38 },
      5: { halign: "center", cellWidth: 18 },
      6: { halign: "center", cellWidth: 12 },
      7: { halign: "right", cellWidth: 16 },
      8: { halign: "right", cellWidth: 18 },
      9: { halign: "right", cellWidth: 18 },
    },
    didDrawPage: (data) => {
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.text(
        `Página ${data.pageNumber} de ${pageCount}`,
        148,
        doc.internal.pageSize.height - 5,
        { align: "center" }
      );
    },
  });

  const fecha = format(new Date(), "yyyy-MM-dd");
  doc.save(`clasificacion-campeonato-salmonidos-${fecha}.pdf`);
}
