<script lang="ts">
  import { onMount } from "svelte";

  let dark = $state(false);

  onMount(() => {
    try {
      const saved = localStorage.getItem("theme");
      dark = saved ? saved === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    } catch {
      dark = false;
    }
    document.documentElement.classList.toggle("dark", dark);
  });

  function toggle() {
    dark = !dark;
    document.documentElement.classList.toggle("dark", dark);
    try {
      localStorage.setItem("theme", dark ? "dark" : "light");
    } catch {
      /* almacenamiento no disponible */
    }
  }
</script>

<button
  type="button"
  onclick={toggle}
  aria-label="Cambiar tema"
  class="rounded-md border border-input px-3 py-1.5 text-sm hover:bg-muted"
>
  {dark ? "☀️ Claro" : "🌙 Oscuro"}
</button>
