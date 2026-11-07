<script lang="ts">
  import { formatDate, formatPuntos } from "$lib/utils";
  import type { PageData } from "./$types";

  export let data: PageData;
</script>

<div class="space-y-6">
  <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
    <div class="rounded-xl border p-4 bg-card">
      <div class="text-xs text-muted-foreground">Pescadores</div>
      <div class="text-2xl font-bold">{data.stats.totalPescadores}</div>
    </div>
    <div class="rounded-xl border p-4 bg-card">
      <div class="text-xs text-muted-foreground">Capturas</div>
      <div class="text-2xl font-bold">{data.stats.totalCapturas}</div>
    </div>
    <div class="rounded-xl border p-4 bg-card">
      <div class="text-xs text-muted-foreground">Puntos</div>
      <div class="text-2xl font-bold">{formatPuntos(data.stats.totalPuntos)}</div>
    </div>
    <div class="rounded-xl border p-4 bg-card">
      <div class="text-xs text-muted-foreground">Mangas activas</div>
      <div class="text-2xl font-bold">{data.stats.mangasActivas}</div>
    </div>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <div class="rounded-xl border bg-card p-4">
      <h2 class="font-semibold mb-2">Top clasificación</h2>
      <div class="space-y-2">
        {#each data.topPescadores as p, i}
          <div class="flex items-center justify-between text-sm">
            <div>{i + 1}. {p.nombre}</div>
            <div class="font-semibold">{formatPuntos(p.totalPuntos)} pts</div>
          </div>
        {/each}
      </div>
    </div>
    <div class="rounded-xl border bg-card p-4">
      <h2 class="font-semibold mb-2">Mejores piezas</h2>
      <div class="space-y-2">
        {#each data.bestFish as fish}
          <div class="flex items-center justify-between text-sm">
            <div>{fish.nombre}</div>
            <div class="font-semibold">{fish.longitudCm} cm</div>
          </div>
        {/each}
      </div>
    </div>
  </div>

  <div class="rounded-xl border bg-card p-4">
    <h2 class="font-semibold mb-2">Últimas capturas</h2>
    <div class="space-y-2">
      {#each data.recentCatches as c}
        <div class="flex items-center justify-between text-sm border-b border-border pb-2 last:border-b-0">
          <div>{c.nombre} · {c.longitudCm} cm · manga {c.manga}</div>
          <div class="text-muted-foreground">{formatDate(c.createdAt)}</div>
        </div>
      {/each}
    </div>
  </div>
</div>
