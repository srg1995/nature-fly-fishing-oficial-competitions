<script lang="ts">
  import type { ActionData } from "./$types";

  export let form: ActionData;
</script>

<div class="min-h-screen bg-background">
  <div class="max-w-4xl mx-auto p-6 space-y-6">
    <div>
      <h1 class="text-2xl font-bold">Nueva competición</h1>
      <p class="text-sm text-muted-foreground">Creación rápida para pruebas de la migración.</p>
    </div>

    {#if form?.error}
      <div class="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
        {form.error}
      </div>
    {/if}

    <form method="POST" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="space-y-1">
        <label for="nombre" class="text-sm font-medium">Nombre</label>
        <input id="nombre" name="nombre" class="w-full rounded-md border border-input px-3 py-2" required />
      </div>
      <div class="space-y-1">
        <label for="edicion" class="text-sm font-medium">Edición</label>
        <input id="edicion" name="edicion" class="w-full rounded-md border border-input px-3 py-2" />
      </div>
      <div class="space-y-1">
        <label for="nivel" class="text-sm font-medium">Nivel</label>
        <select id="nivel" name="nivel" class="w-full rounded-md border border-input px-3 py-2">
          <option value="nacional">Nacional</option>
          <option value="autonomica">Autonómica</option>
          <option value="provincial">Provincial</option>
        </select>
      </div>
      <div class="space-y-1">
        <label for="estado" class="text-sm font-medium">Estado</label>
        <select id="estado" name="estado" class="w-full rounded-md border border-input px-3 py-2">
          <option value="borrador">Borrador</option>
          <option value="publicada">Publicada</option>
          <option value="en_curso">En curso</option>
          <option value="finalizada">Finalizada</option>
          <option value="archivada">Archivada</option>
        </select>
      </div>
      <div class="space-y-1">
        <label for="fechaInicio" class="text-sm font-medium">Fecha inicio</label>
        <input id="fechaInicio" name="fechaInicio" type="date" class="w-full rounded-md border border-input px-3 py-2" required />
      </div>
      <div class="space-y-1">
        <label for="fechaFin" class="text-sm font-medium">Fecha fin</label>
        <input id="fechaFin" name="fechaFin" type="date" class="w-full rounded-md border border-input px-3 py-2" required />
      </div>
      <div class="space-y-1">
        <label for="lugar" class="text-sm font-medium">Lugar</label>
        <input id="lugar" name="lugar" class="w-full rounded-md border border-input px-3 py-2" />
      </div>
      <div class="space-y-1">
        <label for="organizador" class="text-sm font-medium">Organizador</label>
        <input id="organizador" name="organizador" class="w-full rounded-md border border-input px-3 py-2" />
      </div>
      <div class="space-y-1">
        <label for="totalMangas" class="text-sm font-medium">Total mangas</label>
        <input id="totalMangas" name="totalMangas" type="number" min="1" max="10" value="4" class="w-full rounded-md border border-input px-3 py-2" />
      </div>
      <div class="space-y-1">
        <label for="minimaLongitud" class="text-sm font-medium">Mínima longitud (cm)</label>
        <input id="minimaLongitud" name="minimaLongitud" type="number" min="1" max="100" value="19" class="w-full rounded-md border border-input px-3 py-2" />
      </div>
      <div class="space-y-1">
        <label for="comunidadAutonomaId" class="text-sm font-medium">ID Comunidad Autónoma (opcional)</label>
        <input id="comunidadAutonomaId" name="comunidadAutonomaId" type="number" class="w-full rounded-md border border-input px-3 py-2" />
      </div>
      <div class="space-y-1">
        <label for="provinciaId" class="text-sm font-medium">ID Provincia (opcional)</label>
        <input id="provinciaId" name="provinciaId" type="number" class="w-full rounded-md border border-input px-3 py-2" />
      </div>
      <div class="md:col-span-2 space-y-1">
        <label for="rios" class="text-sm font-medium">Ríos (coma separada)</label>
        <input id="rios" name="rios" class="w-full rounded-md border border-input px-3 py-2" />
      </div>
      <div class="md:col-span-2 space-y-1">
        <label for="tramos" class="text-sm font-medium">Tramos (coma separada)</label>
        <input id="tramos" name="tramos" class="w-full rounded-md border border-input px-3 py-2" />
      </div>
      <div class="md:col-span-2 space-y-1">
        <label for="descripcion" class="text-sm font-medium">Descripción</label>
        <textarea id="descripcion" name="descripcion" class="w-full rounded-md border border-input px-3 py-2 min-h-[90px]"></textarea>
      </div>
      <div class="md:col-span-2">
        <button class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
          Crear competición
        </button>
      </div>
    </form>
  </div>
</div>
