<script lang="ts">
  import type { LayoutData } from "./$types";

  export let data: LayoutData;

  const tabs = [
    { href: "", label: "Dashboard" },
    { href: "participantes", label: "Participantes" },
    { href: "capturas", label: "Capturas" },
    { href: "clasificacion", label: "Clasificación" },
    { href: "resultados", label: "Resultados" },
  ];

  if (data.session.rol === "admin" || data.session.rol === "organizador") {
    tabs.push({ href: "admin", label: "Administración" });
  }
</script>

<div class="min-h-screen bg-background">
  <header class="border-b bg-card">
    <div class="max-w-7xl mx-auto p-4 flex items-center justify-between gap-4">
      <div>
        <a href="/panel/competiciones" class="text-xs text-muted-foreground hover:underline">← Competiciones</a>
        <h1 class="text-xl font-bold">{data.competition.nombre}</h1>
        <p class="text-sm text-muted-foreground">{data.competition.edicion}</p>
      </div>
      <a href="/logout" class="rounded-md border border-input px-3 py-1.5 text-sm hover:bg-muted">
        Cerrar sesión
      </a>
    </div>
    <nav class="max-w-7xl mx-auto px-4 pb-3 flex flex-wrap gap-2">
      {#each tabs as tab}
        <a
          href={`/panel/competiciones/${data.competition.id}/${tab.href}`}
          class="rounded-md border border-input bg-background px-3 py-1.5 text-sm hover:bg-muted"
        >
          {tab.label}
        </a>
      {/each}
    </nav>
  </header>
  <main class="max-w-7xl mx-auto p-6">
    <slot />
  </main>
</div>
