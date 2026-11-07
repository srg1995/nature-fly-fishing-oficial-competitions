<script lang="ts">
  let email = "";
  let password = "";
  let error: string | null = null;
  let loading = false;

  async function onSubmit(event: SubmitEvent) {
    event.preventDefault();
    error = null;
    loading = true;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        error = body.error ?? "Credenciales incorrectas";
        loading = false;
        return;
      }

      window.location.href = "/panel";
    } catch {
      error = "Error de conexión. Inténtalo de nuevo.";
      loading = false;
    }
  }
</script>

<div class="min-h-screen bg-gradient-to-br from-river-900 via-river-800 to-forest-900 flex items-center justify-center p-4">
  <div class="w-full max-w-md space-y-6">
    <div class="text-center text-white">
      <h1 class="text-2xl font-bold">VI Campeonato Nacional</h1>
      <p class="text-river-200 mt-1 text-sm">Salmónidos Lance Mosca Dúos</p>
    </div>

    <div class="rounded-xl border border-white/20 bg-white p-6 shadow-2xl space-y-4">
      <div>
        <h2 class="text-xl font-semibold">Iniciar sesión</h2>
        <p class="text-sm text-muted-foreground">
          Accede con tus credenciales de juez u organizador
        </p>
      </div>

      <form class="space-y-4" on:submit={onSubmit}>
        <div class="space-y-1.5">
          <label for="email" class="text-sm font-medium">Email</label>
          <input
            id="email"
            type="email"
            bind:value={email}
            class="h-11 w-full rounded-md border border-input px-3"
            autocomplete="email"
            required
          />
        </div>

        <div class="space-y-1.5">
          <label for="password" class="text-sm font-medium">Contraseña</label>
          <input
            id="password"
            type="password"
            bind:value={password}
            class="h-11 w-full rounded-md border border-input px-3"
            autocomplete="current-password"
            minlength="6"
            required
          />
        </div>

        {#if error}
          <div class="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <p class="text-sm text-destructive">{error}</p>
          </div>
        {/if}

        <button
          type="submit"
          class="w-full h-11 rounded-md bg-primary text-primary-foreground font-medium disabled:opacity-70"
          disabled={loading}
        >
          {#if loading}Accediendo...{:else}Acceder{/if}
        </button>
      </form>
    </div>

    <p class="text-center text-river-300 text-xs">
      Sistema de gestión de competiciones · Captura y Suelta Absoluta
    </p>
  </div>
</div>
