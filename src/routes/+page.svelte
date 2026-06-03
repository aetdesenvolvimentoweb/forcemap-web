<script lang="ts">
  import SummaryView from "$lib/components/SummaryView.svelte";
  import { LogIn } from "lucide-svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  const hasData = $derived(
    data.vehicles.length > 0 ||
      data.officers.length > 0 ||
      data.acas.length > 0 ||
      data.telephonists.length > 0 ||
      data.garrisons.length > 0 ||
      data.serviceSwaps.length > 0,
  );
</script>

<svelte:head>
  <title>Mapa Força — 18º BBM Goianésia</title>
</svelte:head>

<div class="min-h-screen bg-base-200">
  <header class="border-b border-base-300 bg-base-100">
    <div
      class="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3"
    >
      <span class="text-sm font-bold sm:text-base">
        8º CRBM · 18º BBM Goianésia
      </span>
      <a href="/login" class="btn btn-primary btn-sm">
        <LogIn size={18} />
        Acessar sistema
      </a>
    </div>
  </header>

  <main class="mx-auto max-w-3xl px-4 py-6">
    {#if hasData}
      <SummaryView
        vehicles={data.vehicles}
        officers={data.officers}
        acas={data.acas}
        telephonists={data.telephonists}
        garrisons={data.garrisons}
        serviceSwaps={data.serviceSwaps}
        serviceDate={data.serviceDate}
      />
    {:else}
      <div
        class="flex flex-col items-center gap-3 rounded-xl border border-base-300 bg-base-100 px-4 py-16 text-center"
      >
        <h1 class="text-lg font-semibold">Mapa Força</h1>
        <p class="max-w-md text-sm text-base-content/70">
          O resumo do serviço do dia ainda não foi publicado. Assim que estiver
          disponível, ele aparecerá aqui.
        </p>
      </div>
    {/if}
  </main>
</div>
