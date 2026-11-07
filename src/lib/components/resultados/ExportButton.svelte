<script lang="ts">
  import type { PescadorStats } from "@/types";

  interface Props {
    competitionId: string;
  }

  let { competitionId }: Props = $props();
  let busy = $state(false);
  let error = $state("");

  async function exportPdf() {
    busy = true;
    error = "";
    try {
      const res = await fetch(`/api/competiciones/${competitionId}/clasificacion`);
      if (!res.ok) throw new Error("No se pudo obtener la clasificación");
      const { data } = (await res.json()) as { data: PescadorStats[] };
      const { generarPDFClasificacion } = await import("$lib/pdf");
      generarPDFClasificacion(data);
    } catch (e) {
      error = e instanceof Error ? e.message : "Error al exportar";
    } finally {
      busy = false;
    }
  }
</script>

<div class="flex items-center gap-2">
  <a
    href={`/api/competiciones/${competitionId}/exportar`}
    download
    class="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
  >
    Excel (.xlsx)
  </a>
  <button
    type="button"
    onclick={exportPdf}
    disabled={busy}
    class="rounded-md border border-input px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-50"
  >
    {busy ? "Generando…" : "PDF clasificación"}
  </button>
  {#if error}
    <span class="text-sm text-destructive">{error}</span>
  {/if}
</div>
