<script lang="ts">
  import { estadoLabel, formatRange, nivelLabel } from "$lib/public-competitions";
  import type { PageData } from "./$types";

  export let data: PageData;
</script>

<div class="min-h-screen bg-background">
  <div class="max-w-5xl mx-auto p-6 space-y-6">
    <a
      href="/competiciones"
      class="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
    >
      Volver a competiciones
    </a>

    <div class="space-y-3">
      <div class="flex flex-wrap gap-2">
        <span class="inline-flex rounded-full border border-border px-2 py-0.5 text-xs">
          {nivelLabel[data.competition.nivel]}
        </span>
        <span class="inline-flex rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs">
          {estadoLabel[data.competition.estado]}
        </span>
      </div>
      <h1 class="text-3xl font-bold">{data.competition.nombre}</h1>
      {#if data.competition.edicion}
        <p class="text-muted-foreground">{data.competition.edicion}</p>
      {/if}
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="rounded-xl border border-border bg-card p-5">
        <div class="text-xs text-muted-foreground">Fechas</div>
        <div class="font-medium">
          {formatRange(data.competition.fechaInicio, data.competition.fechaFin)}
        </div>
      </div>

      {#if data.competition.lugar}
        <div class="rounded-xl border border-border bg-card p-5">
          <div class="text-xs text-muted-foreground">Lugar</div>
          <div class="font-medium">{data.competition.lugar}</div>
        </div>
      {/if}

      {#if data.competition.organizador}
        <div class="rounded-xl border border-border bg-card p-5">
          <div class="text-xs text-muted-foreground">Organizador</div>
          <div class="font-medium">{data.competition.organizador}</div>
        </div>
      {/if}

      <div class="rounded-xl border border-border bg-card p-5">
        <div class="text-xs text-muted-foreground">Mangas</div>
        <div class="font-medium">{data.competition.totalMangas}</div>
      </div>

      <div class="rounded-xl border border-border bg-card p-5">
        <div class="text-xs text-muted-foreground">Talla mínima</div>
        <div class="font-medium">{data.competition.minimaLongitud} cm</div>
      </div>
    </div>

    {#if data.competition.descripcion}
      <div class="rounded-xl border border-border bg-card p-5">
        <h2 class="font-semibold mb-2">Descripción</h2>
        <p class="text-sm text-muted-foreground whitespace-pre-wrap">
          {data.competition.descripcion}
        </p>
      </div>
    {/if}

    {#if data.competition.rios.length > 0 || data.competition.tramos.length > 0}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        {#if data.competition.rios.length > 0}
          <div class="rounded-xl border border-border bg-card p-5">
            <h2 class="font-semibold mb-2">Ríos</h2>
            <div class="flex flex-wrap gap-2">
              {#each data.competition.rios as rio}
                <span class="inline-flex rounded-full border border-border px-2 py-0.5 text-xs">
                  {rio}
                </span>
              {/each}
            </div>
          </div>
        {/if}
        {#if data.competition.tramos.length > 0}
          <div class="rounded-xl border border-border bg-card p-5">
            <h2 class="font-semibold mb-2">Tramos</h2>
            <div class="flex flex-wrap gap-2">
              {#each data.competition.tramos as tramo}
                <span class="inline-flex rounded-full border border-border px-2 py-0.5 text-xs">
                  {tramo}
                </span>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>
