<script lang="ts">
  import { enhance } from "$app/forms";
  import { Eye, EyeOff } from "lucide-svelte";

  let errorMessage = $state<string | null>(null);
  let showPassword = $state(false);
</script>

<div class="flex min-h-screen items-center justify-center bg-base-200 p-4">
  <form
    method="POST"
    use:enhance={() => async ({ result, update }) => {
      if (result.type === "failure") {
        errorMessage = (result.data as { message?: string })?.message ?? "Erro ao entrar.";
      } else if (result.type === "error") {
        errorMessage = "Erro de comunicação com o servidor.";
      } else {
        errorMessage = null;
        await update();
      }
    }}
    class="w-full max-w-sm space-y-4 rounded-xl bg-base-100 p-6 shadow-lg md:max-w-md md:p-8"
  >
    <h1 class="text-lg font-semibold md:text-xl">Entre com suas credenciais</h1>

    {#if errorMessage}
      <div role="alert" class="alert alert-error text-sm">
        <span>{errorMessage}</span>
      </div>
    {/if}

    <fieldset class="fieldset">
      <legend class="fieldset-legend">RG (somente números)</legend>
      <input
        class="input input-bordered w-full"
        id="rg"
        name="rg"
        type="number"
        placeholder="9999"
        min="1"
        max="10000"
        required
      />
    </fieldset>

    <fieldset class="fieldset">
      <legend class="fieldset-legend">Senha</legend>
      <div class="relative w-full">
        <input
          class="input input-bordered w-full pr-10"
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          minlength="8"
          required
        />
        <button
          type="button"
          class="absolute inset-y-0 right-0 flex items-center pr-3 text-base-content/60 hover:text-base-content"
          onclick={() => (showPassword = !showPassword)}
          aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
        >
          {#if showPassword}
            <EyeOff size={18} />
          {:else}
            <Eye size={18} />
          {/if}
        </button>
      </div>
    </fieldset>

    <button class="btn btn-primary w-full" type="submit">Entrar</button>
  </form>
</div>
