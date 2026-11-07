<script lang="ts">
  import { formatDate } from "$lib/utils";
  import type { RecentCatch } from "@/types";
  import Card from "../ui/Card.svelte";

  interface Props {
    catches: RecentCatch[];
  }

  let { catches }: Props = $props();
</script>

<Card title="Últimas capturas">
  {#if catches.length === 0}
    <p class="text-sm text-muted-foreground text-center py-4">Sin capturas aún</p>
  {:else}
    <ul class="space-y-2">
      {#each catches as c (c.id)}
        <li class="flex items-center justify-between text-sm border-b border-border pb-2 last:border-b-0">
          <span>{c.nombre} · {c.longitudCm} cm · manga {c.manga}</span>
          <span class="text-muted-foreground">{formatDate(c.createdAt)}</span>
        </li>
      {/each}
    </ul>
  {/if}
</Card>
