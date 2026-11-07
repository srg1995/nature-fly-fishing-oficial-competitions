<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    title?: string;
    class?: string;
    children: Snippet;
  }

  let { title, class: className = "", children }: Props = $props();
</script>

<section class="rounded-xl border bg-card p-4 {className}">
  {#if title}
    <h2 class="font-semibold mb-3">{title}</h2>
  {/if}
  {@render children()}
</section>
