"use client";

import { useState } from "react";
import { getExcelFilename } from "@/lib/excel";
import { useClasificacion } from "./use-stats";
import type { DuoStats } from "@/types";
import { generarPDFClasificacion } from "@/lib/pdf";

export function useExport() {
  const [isExporting, setIsExporting] = useState(false);
  const { data: clasificacion } = useClasificacion();

  const exportarExcel = async () => {
    setIsExporting(true);
    try {
      const res = await fetch("/api/exportar");
      if (!res.ok) throw new Error("Error al generar el Excel");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = getExcelFilename();
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  const exportarPDF = () => {
    if (!clasificacion || clasificacion.length === 0) return;
    generarPDFClasificacion(clasificacion as DuoStats[]);
  };

  return { exportarExcel, exportarPDF, isExporting };
}
