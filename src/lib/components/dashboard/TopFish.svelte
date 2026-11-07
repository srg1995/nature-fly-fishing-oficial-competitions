<script lang="ts">
  import type { BestFish } from "@/types";
  import Card from "../ui/Card.svelte";

  interface Props {
    fish: BestFish[];
  }

  let { fish }: Props = $props();
  const medals = ["🥇", "🥈", "🥉"];
</script>

<Card title="Mejores piezas">
  {#if fish.length === 0}
    <p class="text-sm text-muted-foreground text-center py-4">Sin capturas aún</p>
  {:else}
    <div class="space-y-2">
      {#each fish as f, i (f.id)}
        <div class="flex items-center justify-between p-3 rounded-lg bg-muted/50 text-sm">
          <div class="flex items-center gap-3">
            <span class="w-8 text-center text-lg">{medals[i] ?? `${i + 1}º`}</span>
            <div>
              <p class="font-medium">{f.nombre}</p>
              <p class="text-xs text-muted-foreground">Manga {f.manga}</p>
            </div>
          </div>
          <div class="text-right">
            <p class="font-bold">{f.longitudCm} cm</p>
            <p class="text-xs text-amber-600 dark:text-amber-400">{f.puntos} pts</p>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</Card>
