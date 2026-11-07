<script lang="ts">
  import { nivelLabel } from "$lib/public-competitions";
  import type { PageData } from "./$types";

  export let data: PageData;
</script>

<div class="min-h-screen bg-background">
  <div class="max-w-7xl mx-auto p-6 space-y-6">
    <div class="flex items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold">Competiciones</h1>
        <p class="text-sm text-muted-foreground">Gestiona todas las competiciones de la plataforma.</p>
      </div>
      <a
        href="/panel/competiciones/nueva"
        class="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        Nueva competición
      </a>
    </div>

    <div class="rounded-xl border overflow-hidden bg-card">
      <table class="w-full text-sm">
        <thead class="bg-muted/40">
          <tr>
            <th class="text-left px-4 py-2">Nombre</th>
            <th class="text-left px-4 py-2">Nivel</th>
            <th class="text-left px-4 py-2">Estado</th>
            <th class="text-left px-4 py-2">Inicio</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          {#each data.competitions as c}
            <tr>
              <td class="px-4 py-2">
                <a href={`/panel/competiciones/${c.id}`} class="hover:underline">{c.nombre}</a>
              </td>
              <td class="px-4 py-2">{nivelLabel[c.nivel]}</td>
              <td class="px-4 py-2">{c.estado}</td>
              <td class="px-4 py-2">{c.fechaInicio}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>
