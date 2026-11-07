<script lang="ts">
  import LiveRanking from "$lib/components/dashboard/LiveRanking.svelte";
  import RecentCatches from "$lib/components/dashboard/RecentCatches.svelte";
  import TopFish from "$lib/components/dashboard/TopFish.svelte";
  import StatCard from "$lib/components/ui/StatCard.svelte";
  import { formatPuntos } from "$lib/utils";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
</script>

<div class="space-y-6">
  <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
    <StatCard label="Pescadores" value={data.stats.totalPescadores} />
    <StatCard label="Capturas" value={data.stats.totalCapturas} />
    <StatCard label="Puntos" value={formatPuntos(data.stats.totalPuntos)} />
    <StatCard label="Mangas activas" value={data.stats.mangasActivas} />
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <LiveRanking pescadores={data.topPescadores} />
    <TopFish fish={data.bestFish} />
  </div>

  <RecentCatches catches={data.recentCatches} />
</div>
