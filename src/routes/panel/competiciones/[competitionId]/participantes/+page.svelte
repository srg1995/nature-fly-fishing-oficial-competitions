<script lang="ts">
  import type { ActionData, PageData } from "./$types";

  export let data: PageData;
  export let form: ActionData;
</script>

<div class="space-y-6">
  <div>
    <h2 class="text-2xl font-bold">Participantes</h2>
    <p class="text-sm text-muted-foreground">{data.participantes.length} pescadores registrados</p>
  </div>

  {#if form?.error}
    <div class="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
      {form.error}
    </div>
  {/if}

  <form method="POST" action="?/create" class="grid grid-cols-1 md:grid-cols-6 gap-2 rounded-xl border p-3 bg-card">
    <input name="nombre" placeholder="Nombre" class="rounded-md border border-input px-3 py-2 md:col-span-2" required />
    <input name="plica" placeholder="Plica" class="rounded-md border border-input px-3 py-2" required />
    <input name="club" placeholder="Club" class="rounded-md border border-input px-3 py-2" />
    <input name="rio" placeholder="Río" class="rounded-md border border-input px-3 py-2" />
    <input name="tramo" placeholder="Tramo" class="rounded-md border border-input px-3 py-2" />
    <select name="turno" class="rounded-md border border-input px-3 py-2">
      <option value="A">Turno A</option>
      <option value="B">Turno B</option>
    </select>
    <button class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 md:col-span-6">
      Añadir participante
    </button>
  </form>

  <div class="rounded-xl border overflow-hidden bg-card">
    <table class="w-full text-sm">
      <thead class="bg-muted/40">
        <tr>
          <th class="text-left px-4 py-2">Nombre</th>
          <th class="text-left px-4 py-2">Plica</th>
          <th class="text-left px-4 py-2">Club</th>
          <th class="text-left px-4 py-2">Río</th>
          <th class="text-left px-4 py-2">Tramo</th>
          <th class="text-left px-4 py-2">Turno</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-border">
        {#each data.participantes as p}
          <tr>
            <td class="px-4 py-2">{p.nombre}</td>
            <td class="px-4 py-2">{p.plica}</td>
            <td class="px-4 py-2">{p.club}</td>
            <td class="px-4 py-2">{p.rio}</td>
            <td class="px-4 py-2">{p.tramo}</td>
            <td class="px-4 py-2">{p.turno}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
