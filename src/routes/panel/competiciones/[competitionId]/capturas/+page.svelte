<script lang="ts">
  import { formatDate, formatPuntos } from "$lib/utils";
  import type { ActionData, PageData } from "./$types";

  export let data: PageData;
  export let form: ActionData;
</script>

<div class="space-y-6">
  <div>
    <h2 class="text-2xl font-bold">Capturas</h2>
    <p class="text-sm text-muted-foreground">Registro rápido y últimas capturas.</p>
  </div>

  {#if form?.error}
    <div class="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
      {form.error}
    </div>
  {/if}

  <form method="POST" action="?/create" class="grid grid-cols-1 md:grid-cols-6 gap-2 rounded-xl border p-3 bg-card">
    <select name="pescadorId" class="rounded-md border border-input px-3 py-2 md:col-span-2" required>
      <option value="">Selecciona pescador</option>
      {#each data.participantes as p}
        <option value={p.id}>{p.nombre} #{p.plica}</option>
      {/each}
    </select>
    <input name="manga" type="number" min="1" max="10" value="1" class="rounded-md border border-input px-3 py-2" />
    <input name="longitudCm" type="number" min="1" max="200" placeholder="Longitud cm" class="rounded-md border border-input px-3 py-2" required />
    <input name="rio" placeholder="Río" class="rounded-md border border-input px-3 py-2" />
    <input name="tramo" placeholder="Tramo" class="rounded-md border border-input px-3 py-2" />
    <input name="hora" type="time" class="rounded-md border border-input px-3 py-2" />
    <select name="valida" class="rounded-md border border-input px-3 py-2">
      <option value="true">Válida</option>
      <option value="false">No válida</option>
    </select>
    <input name="observaciones" placeholder="Observaciones" class="rounded-md border border-input px-3 py-2 md:col-span-2" />
    <button class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
      Registrar captura
    </button>
  </form>

  <div class="rounded-xl border overflow-hidden bg-card">
    <table class="w-full text-sm">
      <thead class="bg-muted/40">
        <tr>
          <th class="text-left px-4 py-2">Fecha</th>
          <th class="text-left px-4 py-2">Manga</th>
          <th class="text-left px-4 py-2">Longitud</th>
          <th class="text-left px-4 py-2">Puntos</th>
          <th class="text-left px-4 py-2">Río/Tramo</th>
          <th class="text-left px-4 py-2">Estado</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-border">
        {#each data.capturas as c}
          <tr>
            <td class="px-4 py-2">{formatDate(c.createdAt)}</td>
            <td class="px-4 py-2">{c.manga}</td>
            <td class="px-4 py-2">{c.longitudCm} cm</td>
            <td class="px-4 py-2">{formatPuntos(c.puntos)}</td>
            <td class="px-4 py-2">{c.rio} · {c.tramo}</td>
            <td class="px-4 py-2">{c.valida ? "Válida" : "No válida"}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
