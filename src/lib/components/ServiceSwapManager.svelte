<script lang="ts">
  import ConfirmModal from "$lib/components/ConfirmModal.svelte";
  import DataTable from "$lib/components/DataTable.svelte";
  import FormModal from "$lib/components/FormModal.svelte";
  import PageToolbar from "$lib/components/PageToolbar.svelte";
  import SortHeader from "$lib/components/SortHeader.svelte";
  import type { Military, ServiceSwap } from "$lib/types";
  import { formatDateTime } from "$lib/utils/datetime";
  import { createSorting } from "$lib/utils/sorting.svelte";
  import { Pencil, Trash2 } from "lucide-svelte";
  import { tick } from "svelte";

  let {
    serviceSwaps,
    military,
    actionBase,
  }: {
    serviceSwaps: ServiceSwap[];
    military: Military[];
    actionBase: string;
  } = $props();

  let formDialog = $state<HTMLDialogElement>();
  let deleteDialog = $state<HTMLDialogElement>();
  let selected = $state<ServiceSwap | null>(null);
  let substitutedMilitaryId = $state("");
  let substituteMilitaryId = $state("");
  let startsAt = $state("");
  let endsAt = $state("");
  let mode = $state<"create" | "edit">("create");
  let search = $state("");

  const militarySorted = $derived(
    [...military].sort((a, b) => a.militaryRank.order - b.militaryRank.order),
  );

  function militaryLabel(m: Military): string {
    return `${m.militaryRank.abbreviation} ${m.name} (RG ${m.rg})`;
  }

  let filtered = $derived(
    search.trim() === ""
      ? serviceSwaps
      : serviceSwaps.filter((s) => {
          const term = search.toLowerCase();
          return (
            s.substitutedMilitary.name.toLowerCase().includes(term) ||
            s.substituteMilitary.name.toLowerCase().includes(term) ||
            String(s.substitutedMilitary.rg).includes(search.trim()) ||
            String(s.substituteMilitary.rg).includes(search.trim())
          );
        }),
  );

  const sorting = createSorting(() => filtered, {
    key: "startsAt",
  });

  function openCreate() {
    selected = null;
    substitutedMilitaryId = "";
    substituteMilitaryId = "";
    startsAt = "";
    endsAt = "";
    mode = "create";
    formDialog?.showModal();
  }

  async function openEdit(swap: ServiceSwap) {
    selected = null;
    await tick();
    selected = swap;
    substitutedMilitaryId = swap.substitutedMilitary.id;
    substituteMilitaryId = swap.substituteMilitary.id;
    startsAt = swap.startsAt;
    endsAt = swap.endsAt;
    mode = "edit";
    await tick();
    formDialog?.showModal();
  }

  function openDelete(swap: ServiceSwap) {
    selected = swap;
    deleteDialog?.showModal();
  }

  function validateForm(): string | null {
    if (!substitutedMilitaryId || !substituteMilitaryId) {
      return "Selecione os dois militares.";
    }
    if (substitutedMilitaryId === substituteMilitaryId) {
      return "O militar substituto não pode ser igual ao substituído.";
    }
    if (!startsAt || !endsAt) {
      return "Informe o horário inicial e o final.";
    }
    if (endsAt <= startsAt) {
      return "O horário final não pode ser anterior ou igual ao inicial.";
    }
    return null;
  }
</script>

<div class="flex flex-col gap-4">
  <PageToolbar
    title="Trocas de Serviço"
    newLabel="Nova Troca"
    onNew={openCreate}
    bind:search
  />

  <DataTable isEmpty={filtered.length === 0}>
    {#snippet head()}
      <SortHeader
        label="Substituído"
        field="substitutedMilitary.name"
        sortKey={sorting.key}
        sortDir={sorting.dir}
        onSort={sorting.sortBy}
      />
      <SortHeader
        label="Substituto"
        field="substituteMilitary.name"
        sortKey={sorting.key}
        sortDir={sorting.dir}
        onSort={sorting.sortBy}
      />
      <SortHeader
        label="Início"
        field="startsAt"
        sortKey={sorting.key}
        sortDir={sorting.dir}
        onSort={sorting.sortBy}
      />
      <SortHeader
        label="Fim"
        field="endsAt"
        sortKey={sorting.key}
        sortDir={sorting.dir}
        onSort={sorting.sortBy}
      />
      <th class="text-right">Ações</th>
    {/snippet}

    {#snippet rows()}
      {#each sorting.sorted as swap}
        <tr>
          <td>
            {swap.substitutedMilitary.militaryRank?.abbreviation}
            {swap.substitutedMilitary.name}
          </td>
          <td>
            {swap.substituteMilitary.militaryRank?.abbreviation}
            {swap.substituteMilitary.name}
          </td>
          <td>{formatDateTime(swap.startsAt)}</td>
          <td>{formatDateTime(swap.endsAt)}</td>
          <td>
            <div class="flex justify-end gap-1">
              <button
                type="button"
                class="btn btn-ghost min-h-11 min-w-11"
                title="Editar"
                aria-label="Editar"
                onclick={() => openEdit(swap)}
              >
                <Pencil size={18} />
              </button>
              <button
                type="button"
                class="btn btn-ghost text-error min-h-11 min-w-11"
                title="Excluir"
                aria-label="Excluir"
                onclick={() => openDelete(swap)}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </td>
        </tr>
      {/each}
    {/snippet}

    {#snippet cards()}
      {#each sorting.sorted as swap}
        <li
          class="flex items-start justify-between gap-2 rounded-xl border border-base-200 bg-base-100 px-4 py-3"
        >
          <div class="flex flex-col gap-1 flex-1 min-w-0">
            <div class="flex flex-wrap items-center gap-1.5">
              <span class="text-xs text-base-content/60 shrink-0">Substituído:</span>
              <span class="badge badge-neutral badge-sm whitespace-nowrap">{swap.substitutedMilitary.militaryRank?.abbreviation}</span>
              <span class="text-sm font-medium">{swap.substitutedMilitary.name}</span>
            </div>
            <div class="flex flex-wrap items-center gap-1.5">
              <span class="text-xs text-base-content/60 shrink-0">Substituto:</span>
              <span class="badge badge-neutral badge-sm whitespace-nowrap">{swap.substituteMilitary.militaryRank?.abbreviation}</span>
              <span class="text-sm font-medium">{swap.substituteMilitary.name}</span>
            </div>
            <span class="text-xs text-base-content/60">{formatDateTime(swap.startsAt)} a {formatDateTime(swap.endsAt)}</span>
          </div>
          <div class="flex gap-1 shrink-0">
            <button
              type="button"
              class="btn btn-ghost min-h-11 min-w-11"
              title="Editar"
              aria-label="Editar"
              onclick={() => openEdit(swap)}
            >
              <Pencil size={18} />
            </button>
            <button
              type="button"
              class="btn btn-ghost text-error min-h-11 min-w-11"
              title="Excluir"
              aria-label="Excluir"
              onclick={() => openDelete(swap)}
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
  title={mode === "create" ? "Nova Troca de Serviço" : "Editar Troca de Serviço"}
  action={mode === "create"
    ? `${actionBase}?/create`
    : `${actionBase}?/update`}
  submitLabel={mode === "create" ? "Cadastrar" : "Salvar alterações"}
  onValidate={validateForm}
>
  {#if mode === "edit" && selected}
    <input type="hidden" name="id" value={selected.id} />
  {/if}

  <label class="flex flex-col gap-1.5">
    <span class="text-sm font-medium text-base-content">Militar substituído</span>
    <select
      name="substitutedMilitaryId"
      class="select select-bordered w-full"
      bind:value={substitutedMilitaryId}
      required
    >
      <option value="" disabled>Selecione...</option>
      {#each militarySorted as m}
        <option value={m.id}>{militaryLabel(m)}</option>
      {/each}
    </select>
  </label>

  <label class="flex flex-col gap-1.5">
    <span class="text-sm font-medium text-base-content">Militar substituto</span>
    <select
      name="substituteMilitaryId"
      class="select select-bordered w-full"
      bind:value={substituteMilitaryId}
      required
    >
      <option value="" disabled>Selecione...</option>
      {#each militarySorted as m}
        {#if m.id !== substitutedMilitaryId}
          <option value={m.id}>{militaryLabel(m)}</option>
        {/if}
      {/each}
    </select>
  </label>

  <label class="flex flex-col gap-1.5">
    <span class="text-sm font-medium text-base-content">Horário inicial</span>
    <input
      type="datetime-local"
      name="startsAt"
      class="input input-bordered w-full"
      bind:value={startsAt}
      required
    />
  </label>

  <label class="flex flex-col gap-1.5">
    <span class="text-sm font-medium text-base-content">Horário final</span>
    <input
      type="datetime-local"
      name="endsAt"
      class="input input-bordered w-full"
      bind:value={endsAt}
      required
    />
  </label>

  <p class="text-xs text-base-content/60">
    A troca não pode exceder 24 horas e deve terminar no máximo às 08:00 do dia
    seguinte ao início.
  </p>
</FormModal>

<ConfirmModal
  bind:dialog={deleteDialog}
  title="Excluir Troca de Serviço"
  action={`${actionBase}?/delete`}
>
  {#snippet formFields()}
    <input type="hidden" name="id" value={selected?.id} />
  {/snippet}

  <p class="text-sm text-base-content">
    Tem certeza que deseja excluir a troca de
    <strong>
      {selected?.substitutedMilitary.militaryRank?.abbreviation}
      {selected?.substitutedMilitary.name}
    </strong>
    por
    <strong>
      {selected?.substituteMilitary.militaryRank?.abbreviation}
      {selected?.substituteMilitary.name}
    </strong>?
  </p>
  <p class="text-sm text-error font-medium">
    * Esta ação não poderá ser desfeita.
  </p>
</ConfirmModal>
