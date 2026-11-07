<script lang="ts">
  interface Props {
    label: string;
    value: string | number;
  }

  let { label, value }: Props = $props();
</script>

<div class="rounded-xl border p-4 bg-card">
  <div class="text-xs text-muted-foreground">{label}</div>
  <div class="text-2xl font-bold">
    {typeof value === "number" ? value.toLocaleString("es-ES") : value}
  </div>
</div>
