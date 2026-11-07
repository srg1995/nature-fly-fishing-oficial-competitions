<script lang="ts">
  import { estadoLabel, formatRange, nivelLabel } from "$lib/public-competitions";
  import type { PageData } from "./$types";

  export let data: PageData;
</script>

<div class="min-h-screen bg-background">
  <div class="max-w-6xl mx-auto p-6 space-y-6">
    <div class="py-8 text-center">
      <h1 class="text-3xl font-bold">Competiciones</h1>
      <p class="text-muted-foreground mt-2">
        Todas las competiciones publicadas en la plataforma.
      </p>
    </div>

    {#if data.competitions.length === 0}
      <div class="border rounded-lg p-12 text-center text-muted-foreground">
        Aún no hay competiciones publicadas.
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each data.competitions as c}
          <a
            href={`/competiciones/${c.slug}`}
            class="h-full rounded-xl border border-border bg-card text-card-foreground p-5 space-y-3 block hover:border-primary transition-colors"
          >
            <div class="flex items-start justify-between gap-2">
              <span class="inline-flex rounded-full border border-border px-2 py-0.5 text-xs">
                {nivelLabel[c.nivel]}
              </span>
              <span class="inline-flex rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs">
                {estadoLabel[c.estado]}
              </span>
            </div>
            <h2 class="font-semibold leading-tight">{c.nombre}</h2>
            {#if c.edicion}
              <p class="text-xs text-muted-foreground">{c.edicion}</p>
            {/if}
            <div class="text-sm text-muted-foreground">
              {formatRange(c.fechaInicio, c.fechaFin)}
            </div>
            {#if c.lugar}
              <div class="text-sm text-muted-foreground">{c.lugar}</div>
            {/if}
          </a>
        {/each}
      </div>
    {/if}
  </div>
</div>
