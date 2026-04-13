"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  ArrowUpDown, ArrowUp, ArrowDown, Search, ChevronLeft, ChevronRight, SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DuoStats } from "@/types";
import { cn } from "@/lib/utils";

interface ResultadosTableProps {
  data: DuoStats[];
  isLoading?: boolean;
}

const positionBadge = (pos: number) => {
  if (pos === 1) return "bg-amber-400 text-amber-900";
  if (pos === 2) return "bg-slate-300 text-slate-800";
  if (pos === 3) return "bg-orange-400 text-orange-900";
  return "bg-muted text-muted-foreground";
};

export function ResultadosTable({ data, isLoading }: ResultadosTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "totalPuntos", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const columns = useMemo<ColumnDef<DuoStats>[]>(
    () => [
      {
        id: "posicion",
        header: "Pos.",
        cell: ({ row }) => {
          const pos = row.index + 1;
          return (
            <div
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold mx-auto",
                positionBadge(pos)
              )}
            >
              {pos}
            </div>
          );
        },
        enableSorting: false,
        size: 60,
      },
      {
        accessorKey: "nombreDuo",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Dúo
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-1 h-3 w-3" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-1 h-3 w-3" />
            ) : (
              <ArrowUpDown className="ml-1 h-3 w-3 opacity-40" />
            )}
          </Button>
        ),
        cell: ({ row }) => (
          <div>
            <p className="font-semibold">{row.original.nombreDuo}</p>
            <p className="text-xs text-muted-foreground">
              {row.original.pescador1} · {row.original.pescador2}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "plica",
        header: "Plica",
        cell: ({ getValue }) => {
          const v = getValue<string>();
          return v ? <Badge variant="outline" className="font-mono">{v}</Badge> : "—";
        },
      },
      {
        accessorKey: "tramo",
        header: "Tramo",
        cell: ({ getValue }) => getValue<string>() || "—",
      },
      {
        accessorKey: "capturasValidas",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Cap. Válidas
            <ArrowUpDown className="ml-1 h-3 w-3 opacity-40" />
          </Button>
        ),
        cell: ({ getValue }) => (
          <Badge variant="success">{getValue<number>()}</Badge>
        ),
      },
      {
        accessorKey: "capturasMenores18",
        header: "< 18 cm",
        cell: ({ getValue }) => {
          const v = getValue<number>();
          return v > 0 ? <Badge variant="warning">{v}</Badge> : <span className="text-muted-foreground">0</span>;
        },
      },
      {
        accessorKey: "totalCm",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Total cm
            <ArrowUpDown className="ml-1 h-3 w-3 opacity-40" />
          </Button>
        ),
        cell: ({ getValue }) => `${(getValue<number>()).toFixed(1)} cm`,
      },
      {
        accessorKey: "totalPuntos",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Puntos
            <ArrowUpDown className="ml-1 h-3 w-3 opacity-40" />
          </Button>
        ),
        cell: ({ getValue }) => (
          <span className="text-lg font-bold text-primary">
            {(getValue<number>()).toLocaleString("es-ES")}
          </span>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, globalFilter, columnVisibility },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar dúo, pescador, tramo…"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Columnas
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Columnas visibles</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {table
              .getAllColumns()
              .filter((col) => col.getCanHide())
              .map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.id}
                  checked={col.getIsVisible()}
                  onCheckedChange={(val) => col.toggleVisibility(val)}
                >
                  {col.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((header) => (
                    <th key={header.id} className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {columns.map((_, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-4 bg-muted animate-pulse rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8 text-center text-muted-foreground">
                    No hay resultados
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} dúos
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Pág. {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
