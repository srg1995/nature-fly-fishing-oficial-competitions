<script lang="ts">
  import { formatDate } from "$lib/utils";
  import type { PageData } from "./$types";

  export let data: PageData;
</script>

<div class="space-y-6">
  <div>
    <h2 class="text-2xl font-bold">Administración</h2>
    <p class="text-sm text-muted-foreground">Usuarios del sistema y auditoría de la competición.</p>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <div class="rounded-xl border bg-card overflow-hidden">
      <div class="px-4 py-3 border-b"><h3 class="font-semibold">Usuarios</h3></div>
      <table class="w-full text-sm">
        <thead class="bg-muted/40">
          <tr>
            <th class="text-left px-4 py-2">Nombre</th>
            <th class="text-left px-4 py-2">Email</th>
            <th class="text-left px-4 py-2">Rol</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          {#each data.users as user}
            <tr>
              <td class="px-4 py-2">{user.nombre}</td>
              <td class="px-4 py-2">{user.email}</td>
              <td class="px-4 py-2">{user.rol}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <div class="rounded-xl border bg-card overflow-hidden">
      <div class="px-4 py-3 border-b"><h3 class="font-semibold">Auditoría</h3></div>
      <div class="p-3 space-y-2 max-h-[520px] overflow-auto">
        {#each data.audit as entry}
          <div class="rounded-lg border p-2">
            <div class="text-sm font-medium">{entry.accion}</div>
            <div class="text-xs text-muted-foreground">{formatDate(entry.createdAt)}</div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>
