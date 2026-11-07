<script lang="ts">
  import Alert from "$lib/components/ui/Alert.svelte";
  import { generateSlug } from "$lib/validations-competition";
  import type { NivelCompeticion } from "@/types";
  import type { ActionData, PageData } from "./$types";

  let { data, form }: { data: PageData; form: ActionData } = $props();

  type StepKey = "nivel" | "territorio" | "detalles" | "organizador" | "resumen";

  const stepLabels: Record<StepKey, string> = {
    nivel: "Nivel",
    territorio: "Territorio",
    detalles: "Detalles",
    organizador: "Organizador",
    resumen: "Resumen",
  };

  const niveles: Array<{ key: NivelCompeticion; title: string; desc: string }> = [
    { key: "nacional", title: "Nacional", desc: "Ámbito en todo el territorio nacional." },
    { key: "autonomica", title: "Autonómica", desc: "Restringida a una comunidad autónoma." },
    { key: "provincial", title: "Provincial", desc: "Restringida a una provincia concreta." },
  ];

  let nivel = $state<NivelCompeticion | null>(null);
  let comunidadAutonomaId = $state<number | null>(null);
  let provinciaId = $state<number | null>(null);
  let nombre = $state("");
  let edicion = $state("");
  let modalidad = $state("lance_mosca_duos");
  let slug = $state("");
  let slugManual = $state(false);
  let fechaInicio = $state("");
  let fechaFin = $state("");
  let lugar = $state("");
  let descripcion = $state("");
  let organizador = $state("");
  let totalMangas = $state(4);
  let minimaLongitud = $state(19);
  let rios = $state("");
  let tramos = $state("");
  let estado = $state("borrador");
  let stepIdx = $state(0);

  const steps = $derived<StepKey[]>(
    nivel === "nacional"
      ? ["nivel", "detalles", "organizador", "resumen"]
      : ["nivel", "territorio", "detalles", "organizador", "resumen"]
  );
  const current = $derived(steps[stepIdx] ?? "nivel");
  const provinciasFiltradas = $derived(
    data.provincias.filter((p) => p.comunidadAutonomaId === comunidadAutonomaId)
  );
  const ccaaNombre = $derived(data.ccaa.find((c) => c.id === comunidadAutonomaId)?.nombre);
  const provinciaNombre = $derived(data.provincias.find((p) => p.id === provinciaId)?.nombre);

  const valid = $derived.by(() => {
    switch (current) {
      case "nivel":
        return nivel !== null;
      case "territorio":
        if (nivel === "autonomica") return comunidadAutonomaId !== null;
        if (nivel === "provincial") return comunidadAutonomaId !== null && provinciaId !== null;
        return true;
      case "detalles":
        return (
          nombre.trim().length >= 3 &&
          slug.length >= 3 &&
          !!fechaInicio &&
          !!fechaFin &&
          fechaFin >= fechaInicio
        );
      default:
        return true;
    }
  });

  function onNameOrEdition() {
    if (!slugManual) slug = generateSlug(nombre, edicion);
  }

  function selectNivel(value: NivelCompeticion) {
    nivel = value;
    comunidadAutonomaId = null;
    provinciaId = null;
  }

  function go(dir: 1 | -1) {
    stepIdx = Math.min(Math.max(stepIdx + dir, 0), steps.length - 1);
  }

  const summary = $derived<Array<[string, string]>>([
    ["Nivel", niveles.find((n) => n.key === nivel)?.title ?? "—"],
    ...(ccaaNombre ? ([["Comunidad", ccaaNombre]] as Array<[string, string]>) : []),
    ...(provinciaNombre ? ([["Provincia", provinciaNombre]] as Array<[string, string]>) : []),
    ["Nombre", nombre || "—"],
    ["Edición", edicion || "—"],
    ["Slug", slug || "—"],
    ["Modalidad", modalidad],
    ["Fechas", `${fechaInicio} → ${fechaFin}`],
    ["Lugar", lugar || "—"],
    ["Organizador", organizador || "—"],
    ["Total mangas", String(totalMangas)],
    ["Longitud mínima", `${minimaLongitud} cm`],
    ["Ríos", rios || "—"],
    ["Tramos", tramos || "—"],
  ]);

  const input = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm";
</script>

<div class="min-h-screen bg-background">
  <div class="max-w-4xl mx-auto p-6 space-y-6">
    <div>
      <a href="/panel/competiciones" class="text-xs text-muted-foreground hover:underline">← Competiciones</a>
      <h1 class="text-2xl font-bold">Nueva competición</h1>
    </div>

    <ol class="flex items-center gap-3 overflow-x-auto text-xs font-medium">
      {#each steps as key, i}
        <li
          class="flex items-center gap-2 whitespace-nowrap {i === stepIdx
            ? 'text-foreground'
            : 'text-muted-foreground'}"
          aria-current={i === stepIdx ? "step" : undefined}
        >
          <span
            class="w-7 h-7 rounded-full border flex items-center justify-center {i === stepIdx
              ? 'bg-primary text-primary-foreground border-primary'
              : i < stepIdx
                ? 'bg-primary/10 text-primary border-primary/40'
                : 'bg-muted'}">{i + 1}</span
          >
          {stepLabels[key]}
        </li>
      {/each}
    </ol>

    {#if form?.error}
      <Alert message={form.error} />
    {/if}

    <form
      method="POST"
      class="space-y-6"
      onkeydown={(e) => {
        if (e.key === "Enter" && stepIdx < steps.length - 1 && !(e.target instanceof HTMLTextAreaElement)) {
          e.preventDefault();
        }
      }}
    >
      <div class="rounded-xl border bg-card p-6 space-y-4">
        {#if current === "nivel"}
          <h2 class="text-xl font-bold">Nivel de la competición</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            {#each niveles as opt}
              <button
                type="button"
                onclick={() => selectNivel(opt.key)}
                aria-pressed={nivel === opt.key}
                class="text-left rounded-xl border p-4 transition-colors {nivel === opt.key
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:bg-muted'}"
              >
                <p class="font-semibold">{opt.title}</p>
                <p class="text-xs text-muted-foreground mt-1">{opt.desc}</p>
              </button>
            {/each}
          </div>
        {:else if current === "territorio"}
          <h2 class="text-xl font-bold">Territorio</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label for="ccaa" class="text-sm font-medium">Comunidad autónoma</label>
              <select
                id="ccaa"
                class={input}
                value={comunidadAutonomaId ?? ""}
                onchange={(e) => {
                  const v = e.currentTarget.value;
                  comunidadAutonomaId = v ? Number(v) : null;
                  provinciaId = null;
                }}
              >
                <option value="">Selecciona una CCAA</option>
                {#each data.ccaa as c}
                  <option value={c.id}>{c.nombre}</option>
                {/each}
              </select>
            </div>
            {#if nivel === "provincial"}
              <div class="space-y-1.5">
                <label for="prov" class="text-sm font-medium">Provincia</label>
                <select
                  id="prov"
                  class={input}
                  disabled={comunidadAutonomaId === null}
                  value={provinciaId ?? ""}
                  onchange={(e) => {
                    const v = e.currentTarget.value;
                    provinciaId = v ? Number(v) : null;
                  }}
                >
                  <option value="">
                    {comunidadAutonomaId ? "Selecciona una provincia" : "Primero elige una CCAA"}
                  </option>
                  {#each provinciasFiltradas as p}
                    <option value={p.id}>{p.nombre}</option>
                  {/each}
                </select>
              </div>
            {/if}
          </div>
        {:else if current === "detalles"}
          <h2 class="text-xl font-bold">Detalles</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label for="nombre" class="text-sm font-medium">Nombre</label>
              <input id="nombre" class={input} bind:value={nombre} oninput={onNameOrEdition} placeholder="Ej: Campeonato Nacional Salmónidos" />
            </div>
            <div class="space-y-1.5">
              <label for="edicion" class="text-sm font-medium">Edición</label>
              <input id="edicion" class={input} bind:value={edicion} oninput={onNameOrEdition} placeholder="Ej: VI 2025" />
            </div>
            <div class="space-y-1.5 md:col-span-2">
              <label for="slug" class="text-sm font-medium">Slug</label>
              <input id="slug" class={input} bind:value={slug} oninput={() => (slugManual = true)} />
              <p class="text-xs text-muted-foreground">URL pública: /competiciones/{slug || "..."}</p>
            </div>
            <div class="space-y-1.5">
              <label for="fi" class="text-sm font-medium">Fecha de inicio</label>
              <input id="fi" type="date" class={input} bind:value={fechaInicio} />
            </div>
            <div class="space-y-1.5">
              <label for="ff" class="text-sm font-medium">Fecha de fin</label>
              <input id="ff" type="date" class={input} bind:value={fechaFin} />
            </div>
            <div class="space-y-1.5">
              <label for="lugar" class="text-sm font-medium">Lugar</label>
              <input id="lugar" class={input} bind:value={lugar} />
            </div>
            <div class="space-y-1.5">
              <label for="modalidad" class="text-sm font-medium">Modalidad</label>
              <input id="modalidad" class={input} bind:value={modalidad} />
            </div>
            <div class="space-y-1.5">
              <label for="mangas" class="text-sm font-medium">Total de mangas</label>
              <input id="mangas" type="number" min="1" max="10" class={input} bind:value={totalMangas} />
            </div>
            <div class="space-y-1.5">
              <label for="minlong" class="text-sm font-medium">Longitud mínima (cm)</label>
              <input id="minlong" type="number" min="1" max="100" step="0.1" class={input} bind:value={minimaLongitud} />
            </div>
            <div class="space-y-1.5 md:col-span-2">
              <label for="rios" class="text-sm font-medium">Ríos (separados por coma)</label>
              <input id="rios" class={input} bind:value={rios} />
            </div>
            <div class="space-y-1.5 md:col-span-2">
              <label for="tramos" class="text-sm font-medium">Tramos (separados por coma)</label>
              <input id="tramos" class={input} bind:value={tramos} />
            </div>
            <div class="space-y-1.5 md:col-span-2">
              <label for="desc" class="text-sm font-medium">Descripción</label>
              <textarea id="desc" class="{input} min-h-[100px]" bind:value={descripcion}></textarea>
            </div>
          </div>
        {:else if current === "organizador"}
          <h2 class="text-xl font-bold">Organizador</h2>
          <div class="space-y-1.5">
            <label for="org" class="text-sm font-medium">Organizador</label>
            <input id="org" class={input} bind:value={organizador} placeholder="Ej: Federación Española de Pesca" />
          </div>
          <div class="space-y-1.5">
            <label for="estado" class="text-sm font-medium">Estado inicial</label>
            <select id="estado" class={input} bind:value={estado}>
              <option value="borrador">Borrador</option>
              <option value="publicada">Publicada</option>
            </select>
          </div>
        {:else}
          <h2 class="text-xl font-bold">Resumen</h2>
          <p class="text-sm text-muted-foreground">Revisa los datos antes de crear la competición.</p>
          <dl class="divide-y rounded-xl border">
            {#each summary as [label, value]}
              <div class="grid grid-cols-[140px_1fr] gap-4 px-4 py-2.5 text-sm">
                <dt class="text-muted-foreground">{label}</dt>
                <dd class="font-medium">{value}</dd>
              </div>
            {/each}
          </dl>
        {/if}
      </div>

      <!-- Los datos del borrador viajan siempre en el formulario -->
      <input type="hidden" name="nivel" value={nivel ?? ""} />
      <input type="hidden" name="comunidadAutonomaId" value={comunidadAutonomaId ?? ""} />
      <input type="hidden" name="provinciaId" value={provinciaId ?? ""} />
      <input type="hidden" name="nombre" value={nombre} />
      <input type="hidden" name="edicion" value={edicion} />
      <input type="hidden" name="modalidad" value={modalidad} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="fechaInicio" value={fechaInicio} />
      <input type="hidden" name="fechaFin" value={fechaFin} />
      <input type="hidden" name="lugar" value={lugar} />
      <input type="hidden" name="organizador" value={organizador} />
      <input type="hidden" name="totalMangas" value={totalMangas} />
      <input type="hidden" name="minimaLongitud" value={minimaLongitud} />
      <input type="hidden" name="rios" value={rios} />
      <input type="hidden" name="tramos" value={tramos} />
      <input type="hidden" name="descripcion" value={descripcion} />
      <input type="hidden" name="estado" value={estado} />

      <div class="flex justify-between">
        <button
          type="button"
          onclick={() => go(-1)}
          disabled={stepIdx === 0}
          class="rounded-md border border-input px-4 py-2 text-sm hover:bg-muted disabled:opacity-50"
        >
          Anterior
        </button>
        {#if stepIdx < steps.length - 1}
          <button
            type="button"
            onclick={() => go(1)}
            disabled={!valid}
            class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            Siguiente
          </button>
        {:else}
          <button class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
            Crear competición
          </button>
        {/if}
      </div>
    </form>
  </div>
</div>
