<script lang="ts">
  import AcaManager from "$lib/components/AcaManager.svelte";
  import ConfirmModal from "$lib/components/ConfirmModal.svelte";
  import GarrisonManager from "$lib/components/GarrisonManager.svelte";
  import OfficerManager from "$lib/components/OfficerManager.svelte";
  import TelephonistManager from "$lib/components/TelephonistManager.svelte";
  import { VehicleSituation } from "$lib/types";
  import { Check, RefreshCw, X } from "lucide-svelte";
  import type { PageProps } from "./$types";

  type TabId = "oficiais" | "acas" | "cob" | "guarnicoes" | "resumo";

  let { data }: PageProps = $props();

  let resetDialog = $state<HTMLDialogElement>();

  const isComplete = $derived(
    data.officers.length > 0 &&
      data.acas.length > 0 &&
      data.telephonists.length > 0 &&
      data.garrisons.length > 0,
  );

  let activeTab = $state<TabId>("oficiais");

  const activeVehicles = $derived(
    data.vehicles
      .filter((v) => v.situation === VehicleSituation.ATIVA)
      .sort((a, b) => a.name.localeCompare(b.name)),
  );

  const inactiveVehicles = $derived(
    data.vehicles
      .filter((v) => v.situation === VehicleSituation.BAIXADA)
      .sort((a, b) => a.name.localeCompare(b.name)),
  );

  const officersSorted = $derived(
    [...data.officers].sort(
      (a, b) => a.military.militaryRank.order - b.military.militaryRank.order,
    ),
  );

  const acasSorted = $derived(
    [...data.acas].sort(
      (a, b) => a.military.militaryRank.order - b.military.militaryRank.order,
    ),
  );

  const telephonistsSorted = $derived(
    [...data.telephonists].sort(
      (a, b) => a.military.militaryRank.order - b.military.militaryRank.order,
    ),
  );

  const garrisonsSorted = $derived(
    [...data.garrisons].sort((a, b) =>
      a.vehicle.name.localeCompare(b.vehicle.name),
    ),
  );

  function buildSummary(): string {
    const lines: string[] = [];
    const today = new Date().toLocaleDateString("pt-BR");

    lines.push("*MAPA FORÇA 18º BBM*");
    lines.push(`_${today}_`);
    lines.push("");

    lines.push(`*Viaturas Ativas* (${activeVehicles.length})`);
    if (activeVehicles.length === 0) {
      lines.push("_Nenhuma._");
    } else {
      for (const v of activeVehicles) {
        lines.push(`- ${v.name}${v.complement ? ` — ${v.complement}` : ""}`);
      }
    }
    lines.push("");

    lines.push(`*Viaturas Baixadas* (${inactiveVehicles.length})`);
    if (inactiveVehicles.length === 0) {
      lines.push("_Nenhuma._");
    } else {
      for (const v of inactiveVehicles) {
        lines.push(`- ${v.name}${v.complement ? ` — ${v.complement}` : ""}`);
      }
    }
    lines.push("");

    lines.push(
      `*Oficial de Dia / Oficial de Sobreaviso* (${officersSorted.length})`,
    );
    if (officersSorted.length === 0) {
      lines.push("_Nenhum._");
    } else {
      for (const o of officersSorted) {
        lines.push(
          `- ${o.military.militaryRank.abbreviation} ${o.military.name} — ${o.workPeriod} · ${o.workSchedule}`,
        );
      }
    }
    lines.push("");

    lines.push(`*ACA* (${acasSorted.length})`);
    if (acasSorted.length === 0) {
      lines.push("_Nenhum._");
    } else {
      for (const a of acasSorted) {
        lines.push(
          `- ${a.military.militaryRank.abbreviation} ${a.military.name} — ${a.workPeriod} · ${a.workSchedule}`,
        );
      }
    }
    lines.push("");

    lines.push(`*COB* (${telephonistsSorted.length})`);
    if (telephonistsSorted.length === 0) {
      lines.push("_Nenhum._");
    } else {
      for (const t of telephonistsSorted) {
        lines.push(
          `- ${t.military.militaryRank.abbreviation} ${t.military.name} — ${t.workPeriod} · ${t.workSchedule}`,
        );
      }
    }
    lines.push("");

    lines.push(`*Guarnições* (${garrisonsSorted.length})`);
    if (garrisonsSorted.length === 0) {
      lines.push("_Nenhuma._");
    } else {
      for (const g of garrisonsSorted) {
        lines.push("");
        lines.push(
          `*${g.vehicle.name}*${g.vehicle.complement ? ` — ${g.vehicle.complement}` : ""}`,
        );
        for (const m of g.militaryInGarrison) {
          lines.push(
            `- ${m.military.militaryRank.abbreviation} ${m.military.name} — ${m.workPeriod} · ${m.workSchedule}`,
          );
        }
      }
    }

    return lines.join("\n");
  }

  function shareOnWhatsApp() {
    const text = buildSummary();
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

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
        <div class="flex flex-col gap-6">
          <div
            class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <p class="text-sm text-base-content/70">
              Resumo completo. Compartilhe pelo WhatsApp:
            </p>
            <button
              type="button"
              onclick={shareOnWhatsApp}
              class="btn border-none text-white w-full sm:w-auto bg-[#25D366] hover:bg-[#1DA851]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                class="w-5 h-5"
                aria-hidden="true"
              >
                <path
                  d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"
                />
              </svg>
              Compartilhar no WhatsApp
            </button>
          </div>

          <section
            class="overflow-hidden rounded-xl border border-base-200 bg-base-100"
          >
            <header
              class="flex items-center justify-between bg-primary text-primary-content px-4 py-3"
            >
              <h3 class="text-sm font-semibold tracking-wide uppercase">
                Viaturas Ativas
              </h3>
            </header>
            <div class="p-4">
              {#if activeVehicles.length === 0}
                <p class="text-sm text-base-content/50">
                  Nenhuma viatura ativa.
                </p>
              {:else}
                <ul class="flex flex-wrap gap-2">
                  {#each activeVehicles as v}
                    <li
                      class="flex flex-col rounded-lg border border-base-200 bg-base-100 px-3 py-2"
                    >
                      <span class="text-sm font-medium">{v.name}</span>
                      {#if v.complement}
                        <span class="text-xs text-base-content/60"
                          >{v.complement}</span
                        >
                      {/if}
                    </li>
                  {/each}
                </ul>
              {/if}
            </div>
          </section>

          <section
            class="overflow-hidden rounded-xl border border-base-200 bg-base-100"
          >
            <header
              class="flex items-center justify-between bg-base-300 text-base-content px-4 py-3"
            >
              <h3 class="text-sm font-semibold tracking-wide uppercase">
                Viaturas Baixadas
              </h3>
            </header>
            <div class="p-4">
              {#if inactiveVehicles.length === 0}
                <p class="text-sm text-base-content/50">
                  Nenhuma viatura baixada.
                </p>
              {:else}
                <ul class="flex flex-wrap gap-2">
                  {#each inactiveVehicles as v}
                    <li
                      class="flex flex-col rounded-lg border border-base-200 bg-base-200/40 px-3 py-2"
                    >
                      <span class="text-sm font-medium text-base-content/70"
                        >{v.name}</span
                      >
                      {#if v.complement}
                        <span class="text-xs text-base-content/50"
                          >{v.complement}</span
                        >
                      {/if}
                    </li>
                  {/each}
                </ul>
              {/if}
            </div>
          </section>

          <section
            class="overflow-hidden rounded-xl border border-base-200 bg-base-100"
          >
            <header
              class="flex items-center justify-between bg-primary text-primary-content px-4 py-3"
            >
              <h3 class="text-sm font-semibold tracking-wide uppercase">
                Oficial de Dia / Oficial de Sobreaviso
              </h3>
            </header>
            <div class="p-4">
              <ul class="flex flex-col divide-y divide-base-200">
                {#each officersSorted as o}
                  <li
                    class="flex flex-wrap items-center gap-2 py-2 first:pt-0 last:pb-0"
                  >
                    <span class="badge badge-neutral"
                      >{o.military.militaryRank?.abbreviation}</span
                    >
                    <span class="text-sm font-medium">{o.military.name}</span>
                    <span class="text-xs text-base-content/60"
                      >RG {o.military.rg} · {o.workPeriod} · {o.workSchedule}</span
                    >
                  </li>
                {/each}
              </ul>
            </div>
          </section>

          <section
            class="overflow-hidden rounded-xl border border-base-200 bg-base-100"
          >
            <header
              class="flex items-center justify-between bg-primary text-primary-content px-4 py-3"
            >
              <h3 class="text-sm font-semibold tracking-wide uppercase">ACA</h3>
            </header>
            <div class="p-4">
              <ul class="flex flex-col divide-y divide-base-200">
                {#each acasSorted as a}
                  <li
                    class="flex flex-wrap items-center gap-2 py-2 first:pt-0 last:pb-0"
                  >
                    <span class="badge badge-neutral"
                      >{a.military.militaryRank?.abbreviation}</span
                    >
                    <span class="text-sm font-medium">{a.military.name}</span>
                    <span class="text-xs text-base-content/60"
                      >RG {a.military.rg} · {a.workPeriod} · {a.workSchedule}</span
                    >
                  </li>
                {/each}
              </ul>
            </div>
          </section>

          <section
            class="overflow-hidden rounded-xl border border-base-200 bg-base-100"
          >
            <header
              class="flex items-center justify-between bg-primary text-primary-content px-4 py-3"
            >
              <h3 class="text-sm font-semibold tracking-wide uppercase">COB</h3>
            </header>
            <div class="p-4">
              <ul class="flex flex-col divide-y divide-base-200">
                {#each telephonistsSorted as t}
                  <li
                    class="flex flex-wrap items-center gap-2 py-2 first:pt-0 last:pb-0"
                  >
                    <span class="badge badge-neutral"
                      >{t.military.militaryRank?.abbreviation}</span
                    >
                    <span class="text-sm font-medium">{t.military.name}</span>
                    <span class="text-xs text-base-content/60"
                      >RG {t.military.rg} · {t.workPeriod} · {t.workSchedule}</span
                    >
                  </li>
                {/each}
              </ul>
            </div>
          </section>

          <section
            class="overflow-hidden rounded-xl border border-base-200 bg-base-100"
          >
            <header
              class="flex items-center justify-between bg-primary text-primary-content px-4 py-3"
            >
              <h3 class="text-sm font-semibold tracking-wide uppercase">
                Guarnições
              </h3>
            </header>
            <div class="p-4">
              <ul class="flex flex-col gap-3">
                {#each garrisonsSorted as g}
                  <li class="rounded-lg border border-base-200 bg-base-100 p-3">
                    <div
                      class="flex flex-col gap-1 border-b border-base-200 pb-2"
                    >
                      <span class="text-sm font-semibold"
                        >{g.vehicle.name}</span
                      >
                      {#if g.vehicle.complement}
                        <span class="text-xs text-base-content/60"
                          >{g.vehicle.complement}</span
                        >
                      {/if}
                    </div>
                    <ul class="flex flex-col divide-y divide-base-200/60 pt-1">
                      {#each g.militaryInGarrison as m}
                        <li
                          class="flex flex-wrap items-center gap-2 py-2 first:pt-2 last:pb-0"
                        >
                          <span class="badge badge-neutral badge-sm"
                            >{m.military.militaryRank?.abbreviation}</span
                          >
                          <span class="text-sm">{m.military.name}</span>
                          <span class="text-xs text-base-content/60"
                            >RG {m.military.rg} · {m.workPeriod} · {m.workSchedule}</span
                          >
                        </li>
                      {/each}
                    </ul>
                  </li>
                {/each}
              </ul>
            </div>
          </section>
        </div>
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
      >apagar todos os oficiais, ACAs, COB e guarnições</strong
    > cadastrados atualmente, para que você comece um novo resumo do zero.
  </p>
  <p class="text-sm text-base-content/70">
    As viaturas e o efetivo não são afetados.
  </p>
  <p class="text-sm text-error font-medium">
    * Esta ação não poderá ser desfeita.
  </p>
</ConfirmModal>
