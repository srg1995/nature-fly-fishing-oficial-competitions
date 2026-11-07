<script lang="ts">
  interface Props {
    message: string;
    kind?: "error" | "success";
  }

  let { message, kind = "error" }: Props = $props();
</script>

<div
  class="rounded-lg border p-3 text-sm {kind === 'error'
    ? 'border-destructive/30 bg-destructive/10 text-destructive'
    : 'border-green-600/30 bg-green-600/10 text-green-700 dark:text-green-400'}"
  role={kind === "error" ? "alert" : "status"}
>
  {message}
</div>
