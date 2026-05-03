<script lang="ts">
  import ConfirmModal from "$lib/components/ConfirmModal.svelte";
  import DataTable from "$lib/components/DataTable.svelte";
  import FormModal from "$lib/components/FormModal.svelte";
  import PageToolbar from "$lib/components/PageToolbar.svelte";
  import SortHeader from "$lib/components/SortHeader.svelte";
  import { WorkPeriod, WorkSchedule, type ACA } from "$lib/types";
  import { createSorting } from "$lib/utils/sorting.svelte";
  import { Pencil, Trash2 } from "lucide-svelte";
  import { tick } from "svelte";
  import type { PageProps } from "./$types";

  const ACA_RANK_ORDER_MIN = 8;

  let { data }: PageProps = $props();

  let formDialog = $state<HTMLDialogElement>();
  let deleteDialog = $state<HTMLDialogElement>();
  let selected = $state<ACA | null>(null);
  let selectedMilitaryId = $state("");
  let selectedWorkPeriod = $state<WorkPeriod | "">("");
  let selectedWorkSchedule = $state<WorkSchedule | "">("");
  let mode = $state<"create" | "edit">("create");
  let search = $state("");

  let usedMilitaryIds = $derived(
    new Set(data.acas.map((a) => a.military.id)),
  );
  let availableMilitary = $derived(
    data.military
      .filter(
        (m) =>
          m.militaryRank.order >= ACA_RANK_ORDER_MIN &&
          !usedMilitaryIds.has(m.id),
      )
      .sort((a, b) => a.militaryRank.order - b.militaryRank.order),
  );

  let filtered = $derived(
    search.trim() === ""
      ? data.acas
      : data.acas.filter(
          (a) =>
            a.military.name.toLowerCase().includes(search.toLowerCase()) ||
            String(a.military.rg).includes(search.trim()) ||
            a.military.militaryRank?.abbreviation
              ?.toLowerCase()
              .includes(search.toLowerCase()) ||
            a.workPeriod.toLowerCase().includes(search.toLowerCase()) ||
            a.workSchedule.toLowerCase().includes(search.toLowerCase()),
        ),
  );

  const sorting = createSorting(() => filtered, {
    key: "military.militaryRank.order",
  });

  function openCreate() {
    selected = null;
    selectedMilitaryId = "";
    selectedWorkPeriod = "";
    selectedWorkSchedule = "";
    mode = "create";
    formDialog?.showModal();
  }

  async function openEdit(aca: ACA) {
    selected = null;
    selectedWorkPeriod = "";
    selectedWorkSchedule = "";
    await tick();
    selected = aca;
    selectedMilitaryId = aca.military.id;
    selectedWorkPeriod = aca.workPeriod;
    selectedWorkSchedule = aca.workSchedule;
    mode = "edit";
    await tick();
    formDialog?.showModal();
  }

  function openDelete(aca: ACA) {
    selected = aca;
    deleteDialog?.showModal();
  }
</script>

<div class="flex flex-col gap-4">
  <PageToolbar
    title="ACA"
    newLabel="Novo ACA"
    onNew={openCreate}
    bind:search
  />

  <DataTable isEmpty={filtered.length === 0}>
    {#snippet head()}
      <SortHeader
        label="Posto/Grad."
        field="military.militaryRank.order"
        sortKey={sorting.key}
        sortDir={sorting.dir}
        onSort={sorting.sortBy}
      />
      <SortHeader
        label="RG"
        field="military.rg"
        sortKey={sorting.key}
        sortDir={sorting.dir}
        onSort={sorting.sortBy}
      />
      <SortHeader
        label="Nome"
        field="military.name"
        sortKey={sorting.key}
        sortDir={sorting.dir}
        onSort={sorting.sortBy}
      />
      <SortHeader
        label="Período"
        field="workPeriod"
        sortKey={sorting.key}
        sortDir={sorting.dir}
        onSort={sorting.sortBy}
      />
      <SortHeader
        label="Regime"
        field="workSchedule"
        sortKey={sorting.key}
        sortDir={sorting.dir}
        onSort={sorting.sortBy}
      />
      <th class="text-right">Ações</th>
    {/snippet}

    {#snippet rows()}
      {#each sorting.sorted as aca}
        <tr>
          <td>{aca.military.militaryRank?.abbreviation}</td>
          <td>{aca.military.rg}</td>
          <td>{aca.military.name}</td>
          <td>{aca.workPeriod}</td>
          <td>{aca.workSchedule}</td>
          <td>
            <div class="flex justify-end gap-1">
              <button
                type="button"
                class="btn btn-ghost min-h-11 min-w-11"
                title="Editar"
                aria-label="Editar"
                onclick={() => openEdit(aca)}
              >
                <Pencil size={18} />
              </button>
              <button
                type="button"
                class="btn btn-ghost text-error min-h-11 min-w-11"
                title="Excluir"
                aria-label="Excluir"
                onclick={() => openDelete(aca)}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </td>
        </tr>
      {/each}
    {/snippet}

    {#snippet cards()}
      {#each sorting.sorted as aca}
        <li
          class="flex items-center justify-between rounded-xl border border-base-200 bg-base-100 px-4 py-3"
        >
          <div class="flex items-center gap-3">
            <span class="badge badge-neutral"
              >{aca.military.militaryRank?.abbreviation}</span
            >
            <div class="flex flex-col">
              <span class="font-medium text-sm">{aca.military.name}</span>
              <span class="text-xs text-base-content/60"
                >RG {aca.military.rg} · {aca.workPeriod} · {aca.workSchedule}</span
              >
            </div>
          </div>
          <div class="flex gap-1">
            <button
              type="button"
              class="btn btn-ghost min-h-11 min-w-11"
              title="Editar"
              aria-label="Editar"
              onclick={() => openEdit(aca)}
            >
              <Pencil size={18} />
            </button>
            <button
              type="button"
              class="btn btn-ghost text-error min-h-11 min-w-11"
              title="Excluir"
              aria-label="Excluir"
              onclick={() => openDelete(aca)}
            >
              <Trash2 size={18} />
            </button>
          </div>
        </li>
      {/each}
    {/snippet}
  </DataTable>
</div>

<FormModal
  bind:dialog={formDialog}
  title={mode === "create" ? "Novo ACA" : "Editar ACA"}
  action={mode === "create" ? "?/create" : "?/update"}
  submitLabel={mode === "create" ? "Cadastrar" : "Salvar alterações"}
>
  {#if mode === "edit" && selected}
    <input type="hidden" name="id" value={selected.id} />
    <input type="hidden" name="militaryId" value={selectedMilitaryId} />
  {/if}

  {#if mode === "create"}
    <label class="flex flex-col gap-1.5">
      <span class="text-sm font-medium text-base-content">Militar</span>
      <select
        name="militaryId"
        class="select select-bordered w-full"
        bind:value={selectedMilitaryId}
        required
      >
        <option value="" disabled>Selecione...</option>
        {#each availableMilitary as military}
          <option value={military.id}>
            {military.militaryRank.abbreviation}
            {military.name} (RG {military.rg})
          </option>
        {/each}
      </select>
    </label>
  {:else if selected}
    <div class="flex flex-col gap-1.5">
      <span class="text-sm font-medium text-base-content">Militar</span>
      <div
        class="input input-bordered w-full bg-base-200 text-base-content/70 flex items-center"
      >
        {selected.military.militaryRank?.abbreviation}
        {selected.military.name} (RG {selected.military.rg})
      </div>
    </div>
  {/if}

  <label class="flex flex-col gap-1.5">
    <span class="text-sm font-medium text-base-content">Período de Trabalho</span>
    <select
      name="workPeriod"
      class="select select-bordered w-full"
      bind:value={selectedWorkPeriod}
      required
    >
      <option value="" disabled>Selecione...</option>
      {#each Object.values(WorkPeriod) as period}
        <option value={period}>{period}</option>
      {/each}
    </select>
  </label>

  <label class="flex flex-col gap-1.5">
    <span class="text-sm font-medium text-base-content">Regime de Trabalho</span>
    <select
      name="workSchedule"
      class="select select-bordered w-full"
      bind:value={selectedWorkSchedule}
      required
    >
      <option value="" disabled>Selecione...</option>
      {#each Object.values(WorkSchedule) as schedule}
        <option value={schedule}>{schedule}</option>
      {/each}
    </select>
  </label>
</FormModal>

<ConfirmModal
  bind:dialog={deleteDialog}
  title="Excluir ACA"
  action="?/delete"
>
  {#snippet formFields()}
    <input type="hidden" name="id" value={selected?.id} />
  {/snippet}

  <p class="text-sm text-base-content">
    Tem certeza que deseja excluir <strong
      >{selected?.military.militaryRank?.abbreviation}
      {selected?.military.name}</strong
    > da função de ACA?
  </p>
  <p class="text-sm text-error font-medium">
    * Esta ação não poderá ser desfeita.
  </p>
</ConfirmModal>
