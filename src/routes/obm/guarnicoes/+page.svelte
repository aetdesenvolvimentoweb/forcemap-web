<script lang="ts">
  import ConfirmModal from "$lib/components/ConfirmModal.svelte";
  import DataTable from "$lib/components/DataTable.svelte";
  import FormModal from "$lib/components/FormModal.svelte";
  import PageToolbar from "$lib/components/PageToolbar.svelte";
  import SortHeader from "$lib/components/SortHeader.svelte";
  import {
    VehicleSituation,
    WorkPeriod,
    WorkSchedule,
    type Garrison,
  } from "$lib/types";
  import { createSorting } from "$lib/utils/sorting.svelte";
  import { Pencil, Plus, Trash2, X } from "lucide-svelte";
  import { tick } from "svelte";
  import type { PageProps } from "./$types";

  type Row = {
    militaryId: string;
    workPeriod: WorkPeriod | "";
    workSchedule: WorkSchedule | "";
  };

  let { data }: PageProps = $props();

  let formDialog = $state<HTMLDialogElement>();
  let deleteDialog = $state<HTMLDialogElement>();
  let selected = $state<Garrison | null>(null);
  let mode = $state<"create" | "edit">("create");
  let search = $state("");

  let selectedVehicleId = $state("");
  let rows = $state<Row[]>([]);

  const usedVehicleIdsByOtherGarrisons = $derived(
    new Set(
      data.garrisons
        .filter((g) => g.id !== selected?.id)
        .map((g) => g.vehicle.id),
    ),
  );

  const availableVehicles = $derived(
    data.vehicles
      .filter(
        (v) =>
          v.situation === VehicleSituation.ATIVA &&
          !usedVehicleIdsByOtherGarrisons.has(v.id),
      )
      .sort((a, b) => a.name.localeCompare(b.name)),
  );

  const usedMilitaryIdsByOtherGarrisons = $derived(
    new Set(
      data.garrisons
        .filter((g) => g.id !== selected?.id)
        .flatMap((g) => g.militaryInGarrison.map((m) => m.military.id)),
    ),
  );

  function availableMilitaryFor(rowIndex: number) {
    const idsInOtherRows = new Set(
      rows
        .filter((_, i) => i !== rowIndex)
        .map((r) => r.militaryId)
        .filter((id) => id !== ""),
    );
    return data.military
      .filter(
        (m) =>
          !usedMilitaryIdsByOtherGarrisons.has(m.id) &&
          !idsInOtherRows.has(m.id),
      )
      .sort((a, b) => a.militaryRank.order - b.militaryRank.order);
  }

  const filtered = $derived(
    search.trim() === ""
      ? data.garrisons
      : data.garrisons.filter((g) => {
          const term = search.toLowerCase();
          if (g.vehicle.name.toLowerCase().includes(term)) return true;
          if (g.vehicle.complement?.toLowerCase().includes(term)) return true;
          return g.militaryInGarrison.some(
            (m) =>
              m.military.name.toLowerCase().includes(term) ||
              String(m.military.rg).includes(search.trim()) ||
              m.military.militaryRank?.abbreviation
                ?.toLowerCase()
                .includes(term),
          );
        }),
  );

  const sorting = createSorting(() => filtered, { key: "vehicle.name" });

  function newRow(): Row {
    return { militaryId: "", workPeriod: "", workSchedule: "" };
  }

  function addRow() {
    rows = [...rows, newRow()];
  }

  function removeRow(index: number) {
    rows = rows.filter((_, i) => i !== index);
  }

  function openCreate() {
    selected = null;
    selectedVehicleId = "";
    rows = [newRow()];
    mode = "create";
    formDialog?.showModal();
  }

  async function openEdit(garrison: Garrison) {
    selected = null;
    rows = [];
    selectedVehicleId = "";
    await tick();
    selected = garrison;
    selectedVehicleId = garrison.vehicle.id;
    rows = garrison.militaryInGarrison.map((m) => ({
      militaryId: m.military.id,
      workPeriod: m.workPeriod,
      workSchedule: m.workSchedule,
    }));
    mode = "edit";
    await tick();
    formDialog?.showModal();
  }

  function openDelete(garrison: Garrison) {
    selected = garrison;
    deleteDialog?.showModal();
  }

  function validateForm(): string | null {
    if (!selectedVehicleId) return "Selecione uma viatura.";
    if (rows.length === 0) return "Adicione ao menos um militar à guarnição.";

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (!r.militaryId || !r.workPeriod || !r.workSchedule) {
        return `Preencha todos os campos do militar ${i + 1}.`;
      }
    }

    const ids = rows.map((r) => r.militaryId);
    if (new Set(ids).size !== ids.length) {
      return "Não é permitido repetir o mesmo militar na guarnição.";
    }

    if (rows.length === 1) {
      if (rows[0].workPeriod !== WorkPeriod.INTEGRAL) {
        return "Com apenas um militar na guarnição, o período deve ser Integral.";
      }
      return null;
    }

    const hasDiurno = rows.some(
      (r) =>
        r.workPeriod === WorkPeriod.DIURNO ||
        r.workPeriod === WorkPeriod.INTEGRAL,
    );
    const hasNoturno = rows.some(
      (r) =>
        r.workPeriod === WorkPeriod.NOTURNO ||
        r.workPeriod === WorkPeriod.INTEGRAL,
    );
    if (!hasDiurno || !hasNoturno) {
      return "A guarnição deve cobrir os períodos Diurno e Noturno.";
    }
    return null;
  }

  const militaryInGarrisonPayload = $derived(
    JSON.stringify(
      rows.map((r) => ({
        militaryId: r.militaryId,
        workPeriod: r.workPeriod,
        workSchedule: r.workSchedule,
      })),
    ),
  );
</script>

<div class="flex flex-col gap-4">
  <PageToolbar
    title="Guarnições"
    newLabel="Nova Guarnição"
    onNew={openCreate}
    bind:search
  />

  <DataTable isEmpty={filtered.length === 0}>
    {#snippet head()}
      <SortHeader
        label="Viatura"
        field="vehicle.name"
        sortKey={sorting.key}
        sortDir={sorting.dir}
        onSort={sorting.sortBy}
      />
      <th>Militares</th>
      <th class="text-right">Ações</th>
    {/snippet}

    {#snippet rows()}
      {#each sorting.sorted as garrison}
        <tr>
          <td class="align-top">
            <div class="flex flex-col">
              <span class="font-medium">{garrison.vehicle.name}</span>
              {#if garrison.vehicle.complement}
                <span class="text-xs text-base-content/60"
                  >{garrison.vehicle.complement}</span
                >
              {/if}
            </div>
          </td>
          <td class="align-top">
            <ul class="flex flex-col gap-1">
              {#each garrison.militaryInGarrison as m}
                <li class="flex flex-wrap items-center gap-2 text-sm">
                  <span class="badge badge-neutral"
                    >{m.military.militaryRank?.abbreviation}</span
                  >
                  <span>{m.military.name}</span>
                  <span class="text-xs text-base-content/60">
                    RG {m.military.rg} · {m.workPeriod} · {m.workSchedule}
                  </span>
                </li>
              {/each}
            </ul>
          </td>
          <td class="align-top">
            <div class="flex justify-end gap-1">
              <button
                type="button"
                class="btn btn-ghost min-h-11 min-w-11"
                title="Editar"
                aria-label="Editar"
                onclick={() => openEdit(garrison)}
              >
                <Pencil size={18} />
              </button>
              <button
                type="button"
                class="btn btn-ghost text-error min-h-11 min-w-11"
                title="Excluir"
                aria-label="Excluir"
                onclick={() => openDelete(garrison)}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </td>
        </tr>
      {/each}
    {/snippet}

    {#snippet cards()}
      {#each sorting.sorted as garrison}
        <li
          class="flex flex-col gap-2 rounded-xl border border-base-200 bg-base-100 px-4 py-3"
        >
          <div class="flex items-center justify-between">
            <div class="flex flex-col">
              <span class="font-medium text-sm">{garrison.vehicle.name}</span>
              {#if garrison.vehicle.complement}
                <span class="text-xs text-base-content/60"
                  >{garrison.vehicle.complement}</span
                >
              {/if}
            </div>
            <div class="flex gap-1">
              <button
                type="button"
                class="btn btn-ghost min-h-11 min-w-11"
                title="Editar"
                aria-label="Editar"
                onclick={() => openEdit(garrison)}
              >
                <Pencil size={18} />
              </button>
              <button
                type="button"
                class="btn btn-ghost text-error min-h-11 min-w-11"
                title="Excluir"
                aria-label="Excluir"
                onclick={() => openDelete(garrison)}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
          <ul class="flex flex-col gap-1 border-t border-base-200 pt-2">
            {#each garrison.militaryInGarrison as m}
              <li class="flex flex-wrap items-center gap-2 text-xs">
                <span class="badge badge-neutral"
                  >{m.military.militaryRank?.abbreviation}</span
                >
                <span>{m.military.name}</span>
                <span class="text-base-content/60"
                  >· {m.workPeriod} · {m.workSchedule}</span
                >
              </li>
            {/each}
          </ul>
        </li>
      {/each}
    {/snippet}
  </DataTable>
</div>

<FormModal
  bind:dialog={formDialog}
  title={mode === "create" ? "Nova Guarnição" : "Editar Guarnição"}
  action={mode === "create" ? "?/create" : "?/update"}
  submitLabel={mode === "create" ? "Cadastrar" : "Salvar alterações"}
  onValidate={validateForm}
>
  {#if mode === "edit" && selected}
    <input type="hidden" name="id" value={selected.id} />
  {/if}

  <input
    type="hidden"
    name="militaryInGarrison"
    value={militaryInGarrisonPayload}
  />

  <label class="flex flex-col gap-1.5">
    <span class="text-sm font-medium text-base-content">Viatura</span>
    <select
      name="vehicleId"
      class="select select-bordered w-full"
      bind:value={selectedVehicleId}
      required
    >
      <option value="" disabled>Selecione...</option>
      {#each availableVehicles as vehicle}
        <option value={vehicle.id}>
          {vehicle.name}{vehicle.complement ? ` — ${vehicle.complement}` : ""}
        </option>
      {/each}
    </select>
  </label>

  <div class="flex flex-col gap-3">
    <div class="flex items-center justify-between">
      <span class="text-sm font-medium text-base-content">Militares</span>
      <button type="button" class="btn btn-sm btn-ghost gap-1" onclick={addRow}>
        <Plus size={14} /> Adicionar militar
      </button>
    </div>

    {#each rows as row, i (i)}
      {@const opts = availableMilitaryFor(i)}
      <div
        class="flex items-stretch gap-2 rounded-lg border border-base-200 p-3"
      >
        <div class="flex flex-1 flex-col gap-2">
          <label class="flex flex-col gap-1">
            <span class="text-xs text-base-content/70">Militar</span>
            <select
              class="select select-bordered w-full"
              bind:value={rows[i].militaryId}
              required
            >
              <option value="" disabled>Selecione...</option>
              {#if row.militaryId && !opts.some((o) => o.id === row.militaryId)}
                {@const current = data.military.find(
                  (m) => m.id === row.militaryId,
                )}
                {#if current}
                  <option value={current.id}
                    >{current.militaryRank.abbreviation} {current.name} (RG
                    {current.rg})</option
                  >
                {/if}
              {/if}
              {#each opts as m}
                <option value={m.id}
                  >{m.militaryRank.abbreviation} {m.name} (RG {m.rg})</option
                >
              {/each}
            </select>
          </label>

          <div class="flex flex-col gap-2 sm:flex-row sm:items-end">
            <label class="flex flex-1 flex-col gap-1">
              <span class="text-xs text-base-content/70">Período</span>
              <select
                class="select select-bordered select-sm w-full"
                bind:value={rows[i].workPeriod}
                required
              >
                <option value="" disabled>Selecione...</option>
                {#each Object.values(WorkPeriod) as period}
                  <option value={period}>{period}</option>
                {/each}
              </select>
            </label>

            <label class="flex flex-1 flex-col gap-1">
              <span class="text-xs text-base-content/70">Regime</span>
              <select
                class="select select-bordered select-sm w-full"
                bind:value={rows[i].workSchedule}
                required
              >
                <option value="" disabled>Selecione...</option>
                {#each Object.values(WorkSchedule) as schedule}
                  <option value={schedule}>{schedule}</option>
                {/each}
              </select>
            </label>
          </div>
        </div>

        <button
          type="button"
          class="btn btn-ghost text-error h-auto self-stretch"
          title="Remover militar"
          aria-label="Remover militar"
          onclick={() => removeRow(i)}
          disabled={rows.length === 1}
        >
          <X size={18} />
        </button>
      </div>
    {/each}

    {#if rows.length === 0}
      <p class="text-sm text-base-content/60">Nenhum militar adicionado.</p>
    {/if}

    <p class="text-xs text-base-content/60">
      Regra: 1 militar exige período Integral; 2+ militares devem cobrir Diurno
      e Noturno (Integral cobre ambos).
    </p>
  </div>
</FormModal>

<ConfirmModal
  bind:dialog={deleteDialog}
  title="Excluir Guarnição"
  action="?/delete"
>
  {#snippet formFields()}
    <input type="hidden" name="id" value={selected?.id} />
  {/snippet}

  <p class="text-sm text-base-content">
    Tem certeza que deseja excluir a guarnição da viatura
    <strong>{selected?.vehicle.name}</strong>?
  </p>
  <p class="text-sm text-error font-medium">
    * Esta ação não poderá ser desfeita.
  </p>
</ConfirmModal>
