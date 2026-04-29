<script lang="ts">
  import ConfirmModal from "$lib/components/ConfirmModal.svelte";
  import DataTable from "$lib/components/DataTable.svelte";
  import FormModal from "$lib/components/FormModal.svelte";
  import PageToolbar from "$lib/components/PageToolbar.svelte";
  import SortHeader from "$lib/components/SortHeader.svelte";
  import { WorkPeriod, WorkSchedule, type Officer } from "$lib/types";
  import { createSorting } from "$lib/utils/sorting.svelte";
  import { Pencil, Trash2 } from "lucide-svelte";
  import { tick } from "svelte";
  import type { PageProps } from "./$types";

  const OFFICER_RANK_ORDER_LIMIT = 7;

  let { data }: PageProps = $props();

  let formDialog = $state<HTMLDialogElement>();
  let deleteDialog = $state<HTMLDialogElement>();
  let selected = $state<Officer | null>(null);
  let selectedMilitaryId = $state("");
  let selectedWorkPeriod = $state<WorkPeriod | "">("");
  let selectedWorkSchedule = $state<WorkSchedule | "">("");
  let mode = $state<"create" | "edit">("create");
  let search = $state("");

  let usedMilitaryIds = $derived(
    new Set(data.officers.map((o) => o.military.id)),
  );
  let availableMilitary = $derived(
    data.military
      .filter(
        (m) =>
          m.militaryRank.order <= OFFICER_RANK_ORDER_LIMIT &&
          !usedMilitaryIds.has(m.id),
      )
      .sort((a, b) => a.militaryRank.order - b.militaryRank.order),
  );

  let filtered = $derived(
    search.trim() === ""
      ? data.officers
      : data.officers.filter(
          (o) =>
            o.military.name.toLowerCase().includes(search.toLowerCase()) ||
            String(o.military.rg).includes(search.trim()) ||
            o.military.militaryRank?.abbreviation
              ?.toLowerCase()
              .includes(search.toLowerCase()) ||
            o.workPeriod.toLowerCase().includes(search.toLowerCase()) ||
            o.workSchedule.toLowerCase().includes(search.toLowerCase()),
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

  async function openEdit(officer: Officer) {
    selected = null;
    selectedWorkPeriod = "";
    selectedWorkSchedule = "";
    await tick();
    selected = officer;
    selectedMilitaryId = officer.military.id;
    selectedWorkPeriod = officer.workPeriod;
    selectedWorkSchedule = officer.workSchedule;
    mode = "edit";
    await tick();
    formDialog?.showModal();
  }

  function openDelete(officer: Officer) {
    selected = officer;
    deleteDialog?.showModal();
  }
</script>

<div class="flex flex-col gap-4">
  <PageToolbar
    title="Oficial de Dia"
    newLabel="Novo Oficial"
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
      {#each sorting.sorted as officer}
        <tr>
          <td>{officer.military.militaryRank?.abbreviation}</td>
          <td>{officer.military.rg}</td>
          <td>{officer.military.name}</td>
          <td>{officer.workPeriod}</td>
          <td>{officer.workSchedule}</td>
          <td>
            <div class="flex justify-end gap-1">
              <button
                type="button"
                class="btn btn-ghost min-h-11 min-w-11"
                title="Editar"
                aria-label="Editar"
                onclick={() => openEdit(officer)}
              >
                <Pencil size={18} />
              </button>
              <button
                type="button"
                class="btn btn-ghost text-error min-h-11 min-w-11"
                title="Excluir"
                aria-label="Excluir"
                onclick={() => openDelete(officer)}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </td>
        </tr>
      {/each}
    {/snippet}

    {#snippet cards()}
      {#each sorting.sorted as officer}
        <li
          class="flex items-center justify-between rounded-xl border border-base-200 bg-base-100 px-4 py-3"
        >
          <div class="flex items-center gap-3">
            <span class="badge badge-neutral"
              >{officer.military.militaryRank?.abbreviation}</span
            >
            <div class="flex flex-col">
              <span class="font-medium text-sm">{officer.military.name}</span>
              <span class="text-xs text-base-content/60"
                >RG {officer.military.rg} · {officer.workPeriod} · {officer.workSchedule}</span
              >
            </div>
          </div>
          <div class="flex gap-1">
            <button
              type="button"
              class="btn btn-ghost min-h-11 min-w-11"
              title="Editar"
              aria-label="Editar"
              onclick={() => openEdit(officer)}
            >
              <Pencil size={18} />
            </button>
            <button
              type="button"
              class="btn btn-ghost text-error min-h-11 min-w-11"
              title="Excluir"
              aria-label="Excluir"
              onclick={() => openDelete(officer)}
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
  title={mode === "create" ? "Novo Oficial" : "Editar Oficial"}
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
  title="Excluir Oficial"
  action="?/delete"
>
  {#snippet formFields()}
    <input type="hidden" name="id" value={selected?.id} />
  {/snippet}

  <p class="text-sm text-base-content">
    Tem certeza que deseja excluir <strong
      >{selected?.military.militaryRank?.abbreviation}
      {selected?.military.name}</strong
    > da função de oficial de dia?
  </p>
  <p class="text-sm text-error font-medium">
    * Esta ação não poderá ser desfeita.
  </p>
</ConfirmModal>
