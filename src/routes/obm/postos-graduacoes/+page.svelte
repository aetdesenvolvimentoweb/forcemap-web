<script lang="ts">
  import { tick } from "svelte";
  import { Pencil, Trash2 } from "lucide-svelte";
  import ConfirmModal from "$lib/components/ConfirmModal.svelte";
  import DataTable from "$lib/components/DataTable.svelte";
  import FormModal from "$lib/components/FormModal.svelte";
  import PageToolbar from "$lib/components/PageToolbar.svelte";
  import SortHeader from "$lib/components/SortHeader.svelte";
  import { createSorting } from "$lib/utils/sorting.svelte";
  import type { MilitaryRank } from "$lib/types";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  let formDialog = $state<HTMLDialogElement>();
  let deleteDialog = $state<HTMLDialogElement>();
  let selected = $state<MilitaryRank | null>(null);
  let mode = $state<"create" | "edit">("create");
  let search = $state("");

  let filtered = $derived(
    search.trim() === ""
      ? data.ranks
      : data.ranks.filter(
          (r) =>
            r.abbreviation.toLowerCase().includes(search.toLowerCase()) ||
            String(r.order).includes(search.trim()),
        ),
  );

  const sorting = createSorting(() => filtered);

  function openCreate() {
    selected = null;
    mode = "create";
    formDialog?.showModal();
  }

  async function openEdit(rank: MilitaryRank) {
    selected = null;
    await tick();
    selected = rank;
    mode = "edit";
    await tick();
    formDialog?.showModal();
  }

  function openDelete(rank: MilitaryRank) {
    selected = rank;
    deleteDialog?.showModal();
  }
</script>

<div class="flex flex-col gap-4">
  <PageToolbar
    title="Postos/Graduações"
    newLabel="Novo Posto/Graduação"
    onNew={openCreate}
    bind:search
  />

  <DataTable isEmpty={filtered.length === 0}>
    {#snippet head()}
      <SortHeader
        label="Ordem"
        field="order"
        sortKey={sorting.key}
        sortDir={sorting.dir}
        onSort={sorting.sortBy}
        class="w-16"
      />
      <SortHeader
        label="Posto/Graduação"
        field="abbreviation"
        sortKey={sorting.key}
        sortDir={sorting.dir}
        onSort={sorting.sortBy}
      />
      <th class="w-32 text-right">Ações</th>
    {/snippet}

    {#snippet rows()}
      {#each sorting.sorted as rank}
        <tr>
          <td>{rank.order}º</td>
          <td>{rank.abbreviation}</td>
          <td>
            <div class="flex justify-end gap-1">
              <button
                type="button"
                class="btn btn-ghost min-h-11 min-w-11"
                title="Editar"
                aria-label="Editar"
                onclick={() => openEdit(rank)}
              >
                <Pencil size={18} />
              </button>
              <button
                type="button"
                class="btn btn-ghost text-error min-h-11 min-w-11"
                title="Excluir"
                aria-label="Excluir"
                onclick={() => openDelete(rank)}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </td>
        </tr>
      {/each}
    {/snippet}

    {#snippet cards()}
      {#each sorting.sorted as rank}
        <li
          class="flex items-center justify-between rounded-xl border border-base-200 bg-base-100 px-4 py-3"
        >
          <div class="flex items-center gap-3">
            <span class="badge badge-neutral p-2">{rank.order}º</span>
            <span class="font-medium">{rank.abbreviation}</span>
          </div>
          <div class="flex gap-1">
            <button
              type="button"
              class="btn btn-ghost min-h-11 min-w-11"
              title="Editar"
              aria-label="Editar"
              onclick={() => openEdit(rank)}
            >
              <Pencil size={18} />
            </button>
            <button
              type="button"
              class="btn btn-ghost text-error min-h-11 min-w-11"
              title="Excluir"
              aria-label="Excluir"
              onclick={() => openDelete(rank)}
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
  title={mode === "create" ? "Novo Posto/Graduação" : "Editar Posto/Graduação"}
  action={mode === "create" ? "?/create" : "?/update"}
  submitLabel={mode === "create" ? "Criar" : "Salvar alterações"}
>
  {#if mode === "edit" && selected}
    <input type="hidden" name="id" value={selected.id} />
  {/if}

  <label class="flex flex-col gap-1.5">
    <span class="text-sm font-medium text-base-content"
      >Ordem na hierarquia</span
    >
    <input
      type="number"
      name="order"
      class="input input-bordered w-full"
      placeholder="Ex: 1"
      value={selected?.order ?? ""}
      min="1"
      max="20"
      step="1"
      required
    />
  </label>

  <label class="flex flex-col gap-1.5">
    <span class="text-sm font-medium text-base-content">Abreviatura</span>
    <input
      type="text"
      name="abbreviation"
      class="input input-bordered w-full"
      placeholder="Ex: Cel, Ten, Sd"
      value={selected?.abbreviation ?? ""}
      maxlength="15"
      pattern="[a-zA-Z0-9ºª ]+"
      title="Apenas letras, números, espaços e os caracteres ordinais (ºª)"
      required
    />
  </label>
</FormModal>

<ConfirmModal
  bind:dialog={deleteDialog}
  title="Excluir Posto/Graduação"
  action="?/delete"
>
  {#snippet formFields()}
    <input type="hidden" name="id" value={selected?.id} />
  {/snippet}

  <p class="text-sm text-base-content">
    Tem certeza que deseja excluir <strong>{selected?.abbreviation}</strong>?
  </p>
  <p class="text-sm text-error font-medium">
    * Esta ação não poderá ser desfeita.
  </p>
</ConfirmModal>
