import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { DuoStats } from "@/types";

export function generarPDFClasificacion(clasificacion: DuoStats[]): void {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  // Header
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("VI Campeonato Nacional de Salmónidos Lance Mosca Dúos", 148, 20, { align: "center" });

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Clasificación General — Modalidad Captura y Suelta Absoluta", 148, 28, { align: "center" });

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
      ["Pos.", "Dúo", "Pescador 1", "Pescador 2", "Plica", "Tramo", "Cap. Válidas", "< 18cm", "Total cm", "Puntos"],
    ],
    body: clasificacion.map((d) => [
      String(d.posicion ?? ""),
      d.nombreDuo,
      d.pescador1,
      d.pescador2,
      d.plica,
      d.tramo,
      String(d.capturasValidas),
      String(d.capturasMenores18),
      d.totalCm.toFixed(1),
      String(d.totalPuntos),
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
      1: { cellWidth: 40 },
      6: { halign: "center", cellWidth: 18 },
      7: { halign: "center", cellWidth: 12 },
      8: { halign: "right", cellWidth: 16 },
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
