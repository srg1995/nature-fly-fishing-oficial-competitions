"use client";

import { FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useExport } from "@/hooks/use-export";

export function ExportButton() {
  const { exportarExcel, exportarPDF, isExporting } = useExport();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="default" className="gap-2" loading={isExporting}>
          <FileSpreadsheet className="w-4 h-4" />
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Formato de exportación</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={exportarExcel} className="gap-2 cursor-pointer">
          <FileSpreadsheet className="w-4 h-4 text-forest-600" />
          Excel (.xlsx)
          <span className="text-xs text-muted-foreground ml-auto">4 hojas</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportarPDF} className="gap-2 cursor-pointer">
          <FileText className="w-4 h-4 text-river-600" />
          PDF Clasificación
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
