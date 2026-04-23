<script lang="ts">
  import { enhance } from "$app/forms";

  let errorMessage = $state<string | null>(null);
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
      <input
        class="input input-bordered w-full"
        id="password"
        name="password"
        type="password"
        placeholder="••••••••"
        minlength="8"
        required
      />
    </fieldset>

    <button class="btn btn-primary w-full" type="submit">Entrar</button>
  </form>
</div>
