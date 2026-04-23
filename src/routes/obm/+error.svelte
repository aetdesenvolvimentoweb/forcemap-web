<script lang="ts">
  import { page } from "$app/state";
</script>

<div class="flex min-h-screen items-center justify-center bg-base-200 p-4">
  <div class="w-full max-w-sm space-y-4 rounded-xl bg-base-100 p-6 shadow-lg text-center md:max-w-md md:p-8">
    <p class="text-5xl font-bold text-error">{page.status}</p>
    <h1 class="text-lg font-semibold">{page.error?.message ?? "Erro inesperado"}</h1>
    <a href="/login" class="btn btn-primary w-full">Voltar ao login</a>
  </div>
</div>
