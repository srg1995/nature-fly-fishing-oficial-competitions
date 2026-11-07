<script lang="ts">
  import { formatPuntos } from "$lib/utils";
  import type { PescadorStats } from "@/types";
  import Card from "../ui/Card.svelte";

  interface Props {
    pescadores: PescadorStats[];
  }

  let { pescadores }: Props = $props();
  const medals = ["🥇", "🥈", "🥉"];
</script>

<Card title="Top clasificación">
  {#if pescadores.length === 0}
    <p class="text-sm text-muted-foreground text-center py-4">Sin clasificación aún</p>
  {:else}
    <ol class="space-y-2">
      {#each pescadores as p, i (p.pescadorId)}
        <li class="flex items-center justify-between text-sm">
          <span>{medals[i] ?? `${i + 1}.`} {p.nombre}</span>
          <span class="font-semibold">{formatPuntos(p.totalPuntos)} pts</span>
        </li>
      {/each}
    </ol>
  {/if}
</Card>
