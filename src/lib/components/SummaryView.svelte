<script lang="ts">
  import type {
    ACA,
    Garrison,
    Officer,
    ServiceSwap,
    Telephonist,
    Vehicle,
  } from "$lib/types";
  import { formatWorkPeriod, VehicleSituation } from "$lib/types";
  import { formatDateTime, serviceDateRange } from "$lib/utils/datetime";
  import { toBlob } from "html-to-image";

  let {
    vehicles,
    officers,
    acas,
    telephonists,
    garrisons,
    serviceSwaps = [],
    serviceDate = "",
    showShare = false,
  }: {
    vehicles: Vehicle[];
    officers: Officer[];
    acas: ACA[];
    telephonists: Telephonist[];
    garrisons: Garrison[];
    serviceSwaps?: ServiceSwap[];
    serviceDate?: string;
    showShare?: boolean;
  } = $props();

  const activeVehicles = $derived(
    vehicles
      .filter((v) => v.situation === VehicleSituation.ATIVA)
      .sort((a, b) => a.name.localeCompare(b.name)),
  );

  const inactiveVehicles = $derived(
    vehicles
      .filter((v) => v.situation === VehicleSituation.BAIXADA)
      .sort((a, b) => a.name.localeCompare(b.name)),
  );

  const officersSorted = $derived(
    [...officers].sort(
      (a, b) => a.military.militaryRank.order - b.military.militaryRank.order,
    ),
  );

  const acasSorted = $derived(
    [...acas].sort(
      (a, b) => a.military.militaryRank.order - b.military.militaryRank.order,
    ),
  );

  const telephonistsSorted = $derived(
    [...telephonists].sort(
      (a, b) => a.military.militaryRank.order - b.military.militaryRank.order,
    ),
  );

  const garrisonsSorted = $derived(
    [...garrisons].sort((a, b) => a.vehicle.name.localeCompare(b.vehicle.name)),
  );

  const serviceSwapsSorted = $derived(
    [...serviceSwaps].sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
  );

  const serviceRange = $derived(serviceDateRange(serviceDate));

  let summaryEl = $state<HTMLElement>();
  let generatingImage = $state(false);
  let shareFeedback = $state("");

  async function shareImage() {
    if (generatingImage || !summaryEl) return;
    generatingImage = true;
    shareFeedback = "";
    try {
      const blob = await toBlob(summaryEl, {
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        cacheBust: true,
      });
      if (!blob) {
        shareFeedback = "Não foi possível gerar a imagem. Tente novamente.";
        return;
      }

      const stamp = serviceRange.start.replace(/\//g, "-");
      const fileName = `mapa-forca-${stamp}.png`;
      const file = new File([blob], fileName, { type: "image/png" });
      const pageUrl = window.location.href;

      // Celular / navegadores com suporte a compartilhar arquivos: abre a folha
      // nativa (permite mandar direto ao WhatsApp). Inclui o link da página como
      // legenda; se a plataforma não aceitar texto + arquivo juntos, compartilha
      // apenas a imagem.
      const withCaption = {
        files: [file],
        title: "Mapa Força 18º BBM",
        text: pageUrl,
      };
      const shareData = navigator.canShare?.(withCaption)
        ? withCaption
        : navigator.canShare?.({ files: [file] })
          ? { files: [file], title: "Mapa Força 18º BBM" }
          : null;
      if (shareData) {
        try {
          await navigator.share(shareData);
        } catch (err) {
          if ((err as Error)?.name !== "AbortError") {
            shareFeedback = "Não foi possível compartilhar a imagem.";
          }
        }
        return;
      }

      // Desktop: copia para a área de transferência e baixa o arquivo.
      let copied = false;
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        copied = true;
      } catch {
        copied = false;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      shareFeedback = copied
        ? "Imagem copiada e baixada. Cole no WhatsApp com Ctrl+V ou anexe o arquivo."
        : "Imagem baixada. Anexe o arquivo no WhatsApp.";
    } catch {
      shareFeedback = "Não foi possível gerar a imagem. Tente novamente.";
    } finally {
      generatingImage = false;
    }
  }
</script>

<div class="flex flex-col gap-6">
  {#if showShare}
    <div class="flex flex-col gap-2">
      <div
        class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <p class="text-sm text-base-content/70">
          Resumo completo. Gere a imagem para enviar no WhatsApp:
        </p>
        <button
          type="button"
          onclick={shareImage}
          disabled={generatingImage}
          class="btn border-none text-white w-full sm:w-auto bg-[#25D366] hover:bg-[#1DA851]"
        >
          {#if generatingImage}
            <span class="loading loading-spinner loading-sm"></span>
            Gerando imagem...
          {:else}
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
            Compartilhar imagem
          {/if}
        </button>
      </div>
      {#if shareFeedback}
        <p class="text-xs text-base-content/70 sm:text-right">
          {shareFeedback}
        </p>
      {/if}
    </div>
  {/if}

  <div
    bind:this={summaryEl}
    class="flex flex-col gap-4 rounded-xl bg-base-100 p-4"
  >
    <div
      class="rounded-lg bg-primary px-4 py-3 text-center text-primary-content"
    >
      <p class="text-base font-bold tracking-wide">
        8º CRBM - 18º BBM GOIANÉSIA
      </p>
      <p class="text-sm font-semibold">Mapa Força</p>
      <p class="text-xs opacity-90">
        Serviço do dia {serviceRange.start} para o dia {serviceRange.end}
      </p>
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
          <p class="text-sm text-base-content/50">Nenhuma viatura ativa.</p>
        {:else}
          <ul class="flex flex-wrap gap-2">
            {#each activeVehicles as v}
              <li
                class="flex flex-col rounded-lg border border-base-200 bg-base-100 px-3 py-2"
              >
                <span class="text-sm font-medium">{v.name}</span>
                {#if v.complement}
                  <span class="text-xs text-base-content/60">{v.complement}</span
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
          <p class="text-sm text-base-content/50">Nenhuma viatura baixada.</p>
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
                  <span class="text-xs text-base-content/50">{v.complement}</span
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
                >RG {o.military.rg} · {formatWorkPeriod(o.workPeriod)} · {o.workSchedule}</span
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
                >RG {a.military.rg} · {formatWorkPeriod(a.workPeriod)} · {a.workSchedule}</span
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
                >RG {t.military.rg} · {formatWorkPeriod(t.workPeriod)} · {t.workSchedule}</span
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
              <div class="flex flex-col gap-1 border-b border-base-200 pb-2">
                <span class="text-sm font-semibold">{g.vehicle.name}</span>
                {#if g.vehicle.complement}
                  <span class="text-xs text-base-content/60"
                    >{g.vehicle.complement}</span
                  >
                {/if}
              </div>
              <ul class="flex flex-col divide-y divide-base-200/60 pt-1">
                {#each [...g.militaryInGarrison].sort((a, b) => a.military.militaryRank.order - b.military.militaryRank.order) as m}
                  <li
                    class="flex flex-wrap items-center gap-2 py-2 first:pt-2 last:pb-0"
                  >
                    <span class="badge badge-neutral badge-sm"
                      >{m.military.militaryRank?.abbreviation}</span
                    >
                    <span class="text-sm">{m.military.name}</span>
                    <span class="text-xs text-base-content/60"
                      >RG {m.military.rg} · {formatWorkPeriod(m.workPeriod)} · {m.workSchedule}</span
                    >
                  </li>
                {/each}
              </ul>
            </li>
          {/each}
        </ul>
      </div>
    </section>

    {#if serviceSwapsSorted.length > 0}
      <section
        class="overflow-hidden rounded-xl border border-base-200 bg-base-100"
      >
        <header
          class="flex items-center justify-between bg-primary text-primary-content px-4 py-3"
        >
          <h3 class="text-sm font-semibold tracking-wide uppercase">
            Trocas de Serviço
          </h3>
        </header>
        <div class="p-4">
          <ul class="flex flex-col gap-3">
            {#each serviceSwapsSorted as swap}
              <li class="rounded-lg border border-base-200 bg-base-100 p-3">
                <div class="flex flex-col gap-1">
                  <div class="flex flex-wrap items-center gap-1.5">
                    <span class="text-xs font-medium text-base-content/60 min-w-22">Substituído:</span>
                    <span class="badge badge-neutral badge-sm whitespace-nowrap">{swap.substitutedMilitary.militaryRank?.abbreviation}</span>
                    <span class="text-xs text-base-content/60">RG {swap.substitutedMilitary.rg}</span>
                    <span class="text-sm">{swap.substitutedMilitary.name}</span>
                  </div>
                  <div class="flex flex-wrap items-center gap-1.5">
                    <span class="text-xs font-medium text-base-content/60 min-w-22">Substituto:</span>
                    <span class="badge badge-neutral badge-sm whitespace-nowrap">{swap.substituteMilitary.militaryRank?.abbreviation}</span>
                    <span class="text-xs text-base-content/60">RG {swap.substituteMilitary.rg}</span>
                    <span class="text-sm">{swap.substituteMilitary.name}</span>
                  </div>
                  <div class="flex flex-wrap items-center gap-1.5">
                    <span class="text-xs font-medium text-base-content/60 min-w-22">Intervalo:</span>
                    <span class="text-xs text-base-content/60">{formatDateTime(swap.startsAt)} a {formatDateTime(swap.endsAt)}</span>
                  </div>
                </div>
              </li>
            {/each}
          </ul>
        </div>
      </section>
    {/if}
  </div>
</div>
