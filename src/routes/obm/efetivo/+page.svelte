<script lang="ts">
  import { Pencil, Trash2 } from "lucide-svelte";
  import ConfirmModal from "$lib/components/ConfirmModal.svelte";
  import DataTable from "$lib/components/DataTable.svelte";
  import FormModal from "$lib/components/FormModal.svelte";
  import PageToolbar from "$lib/components/PageToolbar.svelte";
  import SortHeader from "$lib/components/SortHeader.svelte";
  import { createSorting } from "$lib/utils/sorting.svelte";
  import type { Military } from "$lib/types";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  let formDialog = $state<HTMLDialogElement>();
  let deleteDialog = $state<HTMLDialogElement>();
  let selected = $state<Military | null>(null);
  let mode = $state<"create" | "edit">("create");
  let search = $state("");

  let filtered = $derived(
    search.trim() === ""
      ? data.military
      : data.military.filter(
          (m) =>
            m.name.toLowerCase().includes(search.toLowerCase()) ||
            String(m.rg).includes(search.trim()) ||
            m.militaryRank?.abbreviation.toLowerCase().includes(search.toLowerCase()),
        ),
  );

  const sorting = createSorting(() => filtered);

  function openCreate() {
    selected = null;
    mode = "create";
    formDialog?.showModal();
  }

  function openEdit(military: Military) {
    selected = military;
    mode = "edit";
    formDialog?.showModal();
  }

  function openDelete(military: Military) {
    selected = military;
    deleteDialog?.showModal();
  }
</script>

<div class="flex flex-col gap-4">
  <PageToolbar
    title="Efetivo"
    newLabel="Novo Militar"
    onNew={openCreate}
    bind:search
  />

  <DataTable isEmpty={filtered.length === 0}>
    {#snippet head()}
      <SortHeader label="Posto/Grad." field="militaryRank.order" sortKey={sorting.key} sortDir={sorting.dir} onSort={sorting.sortBy} />
      <SortHeader label="RG" field="rg" sortKey={sorting.key} sortDir={sorting.dir} onSort={sorting.sortBy} />
      <SortHeader label="Nome" field="name" sortKey={sorting.key} sortDir={sorting.dir} onSort={sorting.sortBy} />
      <th class="text-right">Ações</th>
    {/snippet}

    {#snippet rows()}
      {#each sorting.sorted as military}
        <tr>
          <td>{military.militaryRank?.abbreviation}</td>
          <td>{military.rg}</td>
          <td>{military.name}</td>
          <td>
            <div class="flex justify-end gap-1">
              <button type="button" class="btn btn-ghost min-h-11 min-w-11" title="Editar" aria-label="Editar" onclick={() => openEdit(military)}>
                <Pencil size={18} />
              </button>
              <button type="button" class="btn btn-ghost text-error min-h-11 min-w-11" title="Excluir" aria-label="Excluir" onclick={() => openDelete(military)}>
                <Trash2 size={18} />
              </button>
            </div>
          </td>
        </tr>
      {/each}
    {/snippet}

    {#snippet cards()}
      {#each sorting.sorted as military}
        <li class="flex items-center justify-between rounded-xl border border-base-200 bg-base-100 px-4 py-3">
          <div class="flex items-center gap-3">
            <span class="badge badge-neutral">{military.militaryRank?.abbreviation}</span>
            <div class="flex flex-col">
              <span class="font-medium text-sm">{military.name}</span>
              <span class="text-xs text-base-content/60">RG {military.rg}</span>
            </div>
          </div>
          <div class="flex gap-1">
            <button type="button" class="btn btn-ghost min-h-11 min-w-11" title="Editar" aria-label="Editar" onclick={() => openEdit(military)}>
              <Pencil size={18} />
            </button>
            <button type="button" class="btn btn-ghost text-error min-h-11 min-w-11" title="Excluir" aria-label="Excluir" onclick={() => openDelete(military)}>
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
  title={mode === "create" ? "Novo Militar" : "Editar Militar"}
  action={mode === "create" ? "?/create" : "?/update"}
  submitLabel={mode === "create" ? "Criar" : "Salvar alterações"}
>
  {#if mode === "edit" && selected}
    <input type="hidden" name="id" value={selected.id} />
  {/if}

  <label class="flex flex-col gap-1.5">
    <span class="text-sm font-medium text-base-content">Posto/Graduação</span>
    <select name="militaryRankId" class="select select-bordered w-full" required>
      <option value="" disabled selected={!selected}>Selecione...</option>
      {#each data.ranks as rank}
        <option value={rank.id} selected={selected?.militaryRankId === rank.id}>
          {rank.abbreviation}
        </option>
      {/each}
    </select>
  </label>

  <label class="flex flex-col gap-1.5">
    <span class="text-sm font-medium text-base-content">RG</span>
    <input
      type="number"
      name="rg"
      class="input input-bordered w-full"
      placeholder="Ex: 12345"
      value={selected?.rg ?? ""}
      min="1"
      required
    />
  </label>

  <label class="flex flex-col gap-1.5">
    <span class="text-sm font-medium text-base-content">Nome de Guerra</span>
    <input
      type="text"
      name="name"
      class="input input-bordered w-full"
      placeholder="Ex: Silva"
      value={selected?.name ?? ""}
      required
    />
  </label>
</FormModal>

<ConfirmModal
  bind:dialog={deleteDialog}
  title="Excluir Militar"
  action="?/delete"
>
  {#snippet formFields()}
    <input type="hidden" name="id" value={selected?.id} />
  {/snippet}

  <p class="text-sm text-base-content">
    Tem certeza que deseja excluir <strong>{selected?.militaryRank?.abbreviation} {selected?.name}</strong>?
  </p>
  <p class="text-sm text-error font-medium">Esta ação não poderá ser desfeita.</p>
</ConfirmModal>
