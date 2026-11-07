<script lang="ts">
  import Alert from "$lib/components/ui/Alert.svelte";
  import type { ActionData, PageData } from "./$types";

  export let data: PageData;
  export let form: ActionData;

  $: canEdit = !!data.rol && ["admin", "organizador", "super_admin"].includes(data.rol);
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

  {#if form && "imported" in form && form.importErrors}
    <Alert kind="success" message={`Importados: ${form.imported}. Errores: ${form.importErrors.length}`} />
    {#if form.importErrors.length > 0}
      <ul class="text-sm text-destructive list-disc pl-5">
        {#each form.importErrors as msg}<li>{msg}</li>{/each}
      </ul>
    {/if}
  {/if}

  {#if canEdit}
  <form method="POST" action="?/import" enctype="multipart/form-data" class="flex flex-wrap items-center gap-2 rounded-xl border p-3 bg-card">
    <label for="file" class="text-sm font-medium">Importar desde Excel</label>
    <input id="file" name="file" type="file" accept=".xlsx,.xls" class="text-sm" required />
    <button class="rounded-md border border-input px-3 py-1.5 text-sm hover:bg-muted">Importar</button>
  </form>
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
          <th class="px-4 py-2"><span class="sr-only">Acciones</span></th>
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
            <td class="px-4 py-2 text-right">
              {#if canEdit}
                <form method="POST" action="?/delete" onsubmit={(e) => { if (!confirm("¿Eliminar este participante?")) e.preventDefault(); }}>
                  <input type="hidden" name="id" value={p.id} />
                  <button class="text-sm text-destructive hover:underline">Eliminar</button>
                </form>
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
