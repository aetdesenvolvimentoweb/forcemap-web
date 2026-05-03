<script lang="ts">
  import { VehicleSituation } from "$lib/types";
  import { Share2 } from "lucide-svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

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
</script>

<div class="flex flex-col gap-6">
  <h2 class="text-lg font-bold md:text-xl">Mapa Força 18º BBM</h2>
  <button onclick={shareOnWhatsApp}>
    <Share2 class="w-5 h-5" />
    Compartilhar
  </button>

  <!-- Viaturas Ativas -->
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
                <span class="text-xs text-base-content/60">{v.complement}</span>
              {/if}
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  </section>

  <!-- Viaturas Baixadas -->
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
                <span class="text-xs text-base-content/50">{v.complement}</span>
              {/if}
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  </section>

  <!-- Oficial de Dia / Oficial de Sobreaviso -->
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
      {#if officersSorted.length === 0}
        <p class="text-sm text-base-content/50">Nenhum oficial cadastrado.</p>
      {:else}
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
      {/if}
    </div>
  </section>

  <!-- ACA -->
  <section
    class="overflow-hidden rounded-xl border border-base-200 bg-base-100"
  >
    <header
      class="flex items-center justify-between bg-primary text-primary-content px-4 py-3"
    >
      <h3 class="text-sm font-semibold tracking-wide uppercase">ACA</h3>
    </header>
    <div class="p-4">
      {#if acasSorted.length === 0}
        <p class="text-sm text-base-content/50">Nenhum ACA cadastrado.</p>
      {:else}
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
      {/if}
    </div>
  </section>

  <!-- COB (Telefonistas) -->
  <section
    class="overflow-hidden rounded-xl border border-base-200 bg-base-100"
  >
    <header
      class="flex items-center justify-between bg-primary text-primary-content px-4 py-3"
    >
      <h3 class="text-sm font-semibold tracking-wide uppercase">COB</h3>
    </header>
    <div class="p-4">
      {#if telephonistsSorted.length === 0}
        <p class="text-sm text-base-content/50">
          Nenhum telefonista cadastrado.
        </p>
      {:else}
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
      {/if}
    </div>
  </section>

  <!-- Guarnições -->
  <section
    class="overflow-hidden rounded-xl border border-base-200 bg-base-100"
  >
    <header
      class="flex items-center justify-between bg-primary text-primary-content px-4 py-3"
    >
      <h3 class="text-sm font-semibold tracking-wide uppercase">Guarnições</h3>
    </header>
    <div class="p-4">
      {#if garrisonsSorted.length === 0}
        <p class="text-sm text-base-content/50">
          Nenhuma guarnição cadastrada.
        </p>
      {:else}
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
      {/if}
    </div>
  </section>
</div>
