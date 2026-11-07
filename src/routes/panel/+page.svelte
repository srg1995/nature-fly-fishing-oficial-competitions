<script lang="ts">
  import { formatDate } from "$lib/utils";
  import type { PageData } from "./$types";

  export let data: PageData;
</script>

<div class="min-h-screen bg-background">
  <div class="max-w-7xl mx-auto p-6 space-y-6">
    {#if data.empty}
      <div class="max-w-md text-center space-y-2 mx-auto py-20">
        <h1 class="text-2xl font-bold">Sin competiciones asignadas</h1>
        <p class="text-muted-foreground text-sm">No hay competiciones disponibles todavía.</p>
      </div>
    {:else}
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold">Panel global</h1>
          <p class="text-sm text-muted-foreground">Torre de control de todas las competiciones.</p>
        </div>
        <a
          href="/panel/competiciones/nueva"
          class="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Nueva competición
        </a>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div class="rounded-xl border p-4 bg-card">
          <div class="text-xs text-muted-foreground">Competiciones</div>
          <div class="text-2xl font-bold">{data.stats.totalCompeticiones}</div>
        </div>
        <div class="rounded-xl border p-4 bg-card">
          <div class="text-xs text-muted-foreground">En curso</div>
          <div class="text-2xl font-bold">{data.stats.enCurso}</div>
        </div>
        <div class="rounded-xl border p-4 bg-card">
          <div class="text-xs text-muted-foreground">Finalizadas</div>
          <div class="text-2xl font-bold">{data.stats.finalizadas}</div>
        </div>
        <div class="rounded-xl border p-4 bg-card">
          <div class="text-xs text-muted-foreground">Pescadores únicos</div>
          <div class="text-2xl font-bold">{data.stats.pescadoresUnicos}</div>
        </div>
        <div class="rounded-xl border p-4 bg-card">
          <div class="text-xs text-muted-foreground">Capturas 24h</div>
          <div class="text-2xl font-bold">{data.stats.capturasUltimas24h}</div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-3">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold">Competiciones recientes</h2>
            <a href="/panel/competiciones" class="text-sm text-primary">Ver todas</a>
          </div>
          <div class="rounded-xl border overflow-hidden bg-card">
            <table class="w-full text-sm">
              <thead class="bg-muted/40">
                <tr>
                  <th class="text-left px-4 py-2">Nombre</th>
                  <th class="text-left px-4 py-2">Estado</th>
                  <th class="text-left px-4 py-2">Fecha</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                {#each data.competitions as c}
                  <tr>
                    <td class="px-4 py-2">
                      <a href={`/panel/competiciones/${c.id}`} class="hover:underline">{c.nombre}</a>
                    </td>
                    <td class="px-4 py-2">{c.estado}</td>
                    <td class="px-4 py-2">{c.fechaInicio}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
        <div class="space-y-3">
          <h2 class="text-lg font-semibold">Actividad reciente</h2>
          <div class="space-y-2">
            {#each data.audit as entry}
              <div class="rounded-xl border bg-card p-3">
                <div class="text-xs font-medium">{entry.accion}</div>
                <div class="text-xs text-muted-foreground">{formatDate(entry.createdAt)}</div>
              </div>
            {/each}
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
