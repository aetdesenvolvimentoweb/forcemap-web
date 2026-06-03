<script lang="ts">
  import AcaManager from "$lib/components/AcaManager.svelte";
  import ConfirmModal from "$lib/components/ConfirmModal.svelte";
  import GarrisonManager from "$lib/components/GarrisonManager.svelte";
  import OfficerManager from "$lib/components/OfficerManager.svelte";
  import ServiceSwapManager from "$lib/components/ServiceSwapManager.svelte";
  import SummaryView from "$lib/components/SummaryView.svelte";
  import TelephonistManager from "$lib/components/TelephonistManager.svelte";
  import { Check, RefreshCw, X } from "lucide-svelte";
  import type { PageProps } from "./$types";

  type TabId =
    | "oficiais"
    | "acas"
    | "cob"
    | "guarnicoes"
    | "trocas"
    | "resumo";

  let { data }: PageProps = $props();

  let resetDialog = $state<HTMLDialogElement>();

  const isComplete = $derived(
    data.officers.length > 0 &&
      data.acas.length > 0 &&
      data.telephonists.length > 0 &&
      data.garrisons.length > 0,
  );

  let activeTab = $state<TabId>("oficiais");

  function goToTab(tab: TabId) {
    activeTab = tab;
  }

  const checklist = $derived([
    {
      label: "Oficiais",
      count: data.officers.length,
      tab: "oficiais" as TabId,
    },
    { label: "ACAs", count: data.acas.length, tab: "acas" as TabId },
    {
      label: "COB",
      count: data.telephonists.length,
      tab: "cob" as TabId,
    },
    {
      label: "Guarnições",
      count: data.garrisons.length,
      tab: "guarnicoes" as TabId,
    },
  ]);
</script>

<div class="flex flex-col gap-4">
  <div
    class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
  >
    <h2 class="text-lg font-bold md:text-xl">Mapa Força 18º BBM</h2>
    <button
      type="button"
      class="btn btn-outline btn-error w-full sm:w-auto"
      onclick={() => resetDialog?.showModal()}
    >
      <RefreshCw size={18} />
      Novo resumo
    </button>
  </div>

  <div class="overflow-x-auto">
    <div role="tablist" class="tabs tabs-lift">
      <button
        type="button"
        role="tab"
        class="tab"
        class:tab-active={activeTab === "oficiais"}
        onclick={() => (activeTab = "oficiais")}
      >
        Oficiais
        {#if data.officers.length > 0}
          <span class="badge badge-sm badge-primary ml-2"
            >{data.officers.length}</span
          >
        {/if}
      </button>
      <button
        type="button"
        role="tab"
        class="tab"
        class:tab-active={activeTab === "acas"}
        onclick={() => (activeTab = "acas")}
      >
        ACAs
        {#if data.acas.length > 0}
          <span class="badge badge-sm badge-primary ml-2"
            >{data.acas.length}</span
          >
        {/if}
      </button>
      <button
        type="button"
        role="tab"
        class="tab"
        class:tab-active={activeTab === "cob"}
        onclick={() => (activeTab = "cob")}
      >
        COB
        {#if data.telephonists.length > 0}
          <span class="badge badge-sm badge-primary ml-2"
            >{data.telephonists.length}</span
          >
        {/if}
      </button>
      <button
        type="button"
        role="tab"
        class="tab"
        class:tab-active={activeTab === "guarnicoes"}
        onclick={() => (activeTab = "guarnicoes")}
      >
        Guarnições
        {#if data.garrisons.length > 0}
          <span class="badge badge-sm badge-primary ml-2"
            >{data.garrisons.length}</span
          >
        {/if}
      </button>
      <button
        type="button"
        role="tab"
        class="tab"
        class:tab-active={activeTab === "trocas"}
        onclick={() => (activeTab = "trocas")}
      >
        Trocas
        {#if data.serviceSwaps.length > 0}
          <span class="badge badge-sm badge-primary ml-2"
            >{data.serviceSwaps.length}</span
          >
        {/if}
      </button>
      <button
        type="button"
        role="tab"
        class="tab"
        class:tab-active={activeTab === "resumo"}
        onclick={() => (activeTab = "resumo")}
      >
        Resumo
        {#if isComplete}
          <Check size={14} class="ml-2 text-success" />
        {/if}
      </button>
    </div>
  </div>

  <div
    class="rounded-box border border-base-300 bg-base-100 p-4 md:p-6"
    role="tabpanel"
  >
    {#if activeTab === "oficiais"}
      <OfficerManager
        officers={data.officers}
        military={data.military}
        actionBase="/obm/oficial"
      />
    {:else if activeTab === "acas"}
      <AcaManager
        acas={data.acas}
        military={data.military}
        actionBase="/obm/aca"
      />
    {:else if activeTab === "cob"}
      <TelephonistManager
        telephonists={data.telephonists}
        military={data.military}
        actionBase="/obm/telefonistas"
      />
    {:else if activeTab === "guarnicoes"}
      <GarrisonManager
        garrisons={data.garrisons}
        military={data.military}
        vehicles={data.vehicles}
        actionBase="/obm/guarnicoes"
      />
    {:else if activeTab === "trocas"}
      <ServiceSwapManager
        serviceSwaps={data.serviceSwaps}
        military={data.military}
        actionBase="/obm/trocas"
      />
    {:else if activeTab === "resumo"}
      {#if !isComplete}
        <div
          class="flex flex-col items-center gap-5 py-10 text-center md:py-16"
        >
          <h3 class="text-lg font-semibold">Resumo incompleto</h3>
          <p class="text-sm text-base-content/70 max-w-md">
            Para gerar o resumo do dia, preencha todas as seções abaixo. Clique
            em uma pendência para ir direto à seção.
          </p>
          <ul class="flex flex-col gap-2 w-full max-w-xs">
            {#each checklist as item}
              <li>
                <button
                  type="button"
                  class="flex items-center gap-3 w-full rounded-lg border border-base-200 bg-base-100 px-4 py-2 text-left hover:bg-base-200 transition"
                  onclick={() => goToTab(item.tab)}
                >
                  {#if item.count > 0}
                    <Check size={18} class="text-success shrink-0" />
                  {:else}
                    <X size={18} class="text-error shrink-0" />
                  {/if}
                  <span class="flex-1 text-sm">{item.label}</span>
                  <span class="text-xs text-base-content/60"
                    >{item.count}</span
                  >
                </button>
              </li>
            {/each}
          </ul>
        </div>
      {:else}
        <SummaryView
          vehicles={data.vehicles}
          officers={data.officers}
          acas={data.acas}
          telephonists={data.telephonists}
          garrisons={data.garrisons}
          serviceSwaps={data.serviceSwaps}
          serviceDate={data.serviceDate}
          showShare
        />
      {/if}
    {/if}
  </div>
</div>

<ConfirmModal
  bind:dialog={resetDialog}
  title="Iniciar novo resumo"
  action="?/reset"
>
  <p class="text-sm text-base-content">
    Esta ação irá <strong
      >apagar todos os oficiais, ACAs, COB, guarnições e trocas de serviço</strong
    > cadastrados atualmente, para que você comece um novo resumo do zero.
  </p>
  <p class="text-sm text-base-content/70">
    As viaturas e o efetivo não são afetados.
  </p>
  <p class="text-sm text-error font-medium">
    * Esta ação não poderá ser desfeita.
  </p>
</ConfirmModal>
