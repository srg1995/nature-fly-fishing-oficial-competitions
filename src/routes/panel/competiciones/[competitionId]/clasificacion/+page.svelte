<script lang="ts">
  import { formatPuntos } from "$lib/utils";
  import type { PageData } from "./$types";

  export let data: PageData;
</script>

<div class="space-y-6">
  <div>
    <h2 class="text-2xl font-bold">Clasificación</h2>
    <p class="text-sm text-muted-foreground">Ranking en vivo de la competición.</p>
  </div>

  <div class="rounded-xl border overflow-hidden bg-card">
    <table class="w-full text-sm">
      <thead class="bg-muted/40">
        <tr>
          <th class="text-left px-4 py-2">Pos</th>
          <th class="text-left px-4 py-2">Pescador</th>
          <th class="text-left px-4 py-2">Club</th>
          <th class="text-left px-4 py-2">Capturas válidas</th>
          <th class="text-left px-4 py-2">Mejor pieza</th>
          <th class="text-left px-4 py-2">Puntos</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-border">
        {#each data.clasificacion as p, i}
          <tr>
            <td class="px-4 py-2 font-semibold">{i + 1}</td>
            <td class="px-4 py-2">{p.nombre}</td>
            <td class="px-4 py-2">{p.club}</td>
            <td class="px-4 py-2">{p.capturasValidas}</td>
            <td class="px-4 py-2">{p.mejorPieza} cm</td>
            <td class="px-4 py-2 font-semibold">{formatPuntos(p.totalPuntos)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
