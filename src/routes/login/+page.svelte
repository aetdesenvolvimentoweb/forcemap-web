<script lang="ts">
  import { enhance } from "$app/forms";
  import type { ActionData } from "../$types";

  let { form }: { form: ActionData } = $props();
</script>

<div class="flex min-h-screen items-center justify-center bg-green-100">
  <form
    method="POST"
    use:enhance
    class="mx-auto w-full max-w-md space-y-4 rounded-lg border border-gray-300 bg-white p-6 shadow"
  >
    <h1 class="text-xl font-semibold text-gray-800">
      Entre com suas credenciais
    </h1>

    {#if form?.message}
      <p class="rounded bg-red-100 px-3 py-2 text-sm text-red-700">
        {form.message}
      </p>
    {/if}

    <div>
      <label class="block text-sm font-medium text-gray-900" for="rg">
        RG (somente números)
      </label>
      <input
        class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
        id="rg"
        name="rg"
        type="number"
        placeholder="9999"
        required
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-900" for="password"
        >Senha</label
      >
      <input
        class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
        id="password"
        name="password"
        type="password"
        placeholder="••••••••"
        required
      />
    </div>

    <button
      class="block w-full rounded-lg bg-indigo-600 px-12 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
      type="submit"
    >
      Entrar
    </button>
  </form>
</div>
