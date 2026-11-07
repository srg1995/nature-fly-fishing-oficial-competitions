<script lang="ts">
  import ExportButton from "$lib/components/resultados/ExportButton.svelte";
  import { formatPuntos } from "$lib/utils";
  import type { PageData } from "./$types";

  export let data: PageData;
</script>

<div class="space-y-6">
  <div class="flex flex-wrap items-start justify-between gap-3">
    <div>
      <h2 class="text-2xl font-bold">Resultados</h2>
      <p class="text-sm text-muted-foreground">Tabla completa de resultados.</p>
    </div>
    <ExportButton competitionId={data.competitionId} />
  </div>

  <div class="rounded-xl border overflow-hidden bg-card">
    <table class="w-full text-sm">
      <thead class="bg-muted/40">
        <tr>
          <th class="text-left px-4 py-2">Pos</th>
          <th class="text-left px-4 py-2">Pescador</th>
          <th class="text-left px-4 py-2">Plica</th>
          <th class="text-left px-4 py-2">Río</th>
          <th class="text-left px-4 py-2">Tramo</th>
          <th class="text-left px-4 py-2">Puntos</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-border">
        {#each data.clasificacion as p, i}
          <tr>
            <td class="px-4 py-2 font-semibold">{i + 1}</td>
            <td class="px-4 py-2">{p.nombre}</td>
            <td class="px-4 py-2">{p.plica}</td>
            <td class="px-4 py-2">{p.rio}</td>
            <td class="px-4 py-2">{p.tramo}</td>
            <td class="px-4 py-2 font-semibold">{formatPuntos(p.totalPuntos)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
