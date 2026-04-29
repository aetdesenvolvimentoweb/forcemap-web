<script lang="ts">
  import ConfirmModal from "$lib/components/ConfirmModal.svelte";
  import DataTable from "$lib/components/DataTable.svelte";
  import FormModal from "$lib/components/FormModal.svelte";
  import PageToolbar from "$lib/components/PageToolbar.svelte";
  import SortHeader from "$lib/components/SortHeader.svelte";
  import { VehicleSituation, type Vehicle } from "$lib/types";
  import { createSorting } from "$lib/utils/sorting.svelte";
  import { Pencil, Trash2 } from "lucide-svelte";
  import { tick } from "svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  let formDialog = $state<HTMLDialogElement>();
  let deleteDialog = $state<HTMLDialogElement>();
  let selected = $state<Vehicle | null>(null);
  let selectedSituation = $state<VehicleSituation | "">("");
  let complementValue = $state("");
  let mode = $state<"create" | "edit">("create");
  let search = $state("");

  let complementEnabled = $derived(
    selectedSituation === VehicleSituation.BAIXADA,
  );

  let filtered = $derived(
    search.trim() === ""
      ? data.vehicles
      : data.vehicles.filter(
          (v) =>
            v.name.toLowerCase().includes(search.toLowerCase()) ||
            v.situation.toLowerCase().includes(search.toLowerCase()) ||
            v.complement?.toLowerCase().includes(search.toLowerCase()),
        ),
  );

  const sorting = createSorting(() => filtered, { key: "name" });

  function openCreate() {
    selected = null;
    selectedSituation = VehicleSituation.ATIVA;
    complementValue = "";
    mode = "create";
    formDialog?.showModal();
  }

  async function openEdit(vehicle: Vehicle) {
    selected = null;
    selectedSituation = "";
    complementValue = "";
    await tick();
    selected = vehicle;
    selectedSituation = vehicle.situation;
    complementValue = vehicle.complement ?? "";
    mode = "edit";
    await tick();
    formDialog?.showModal();
  }

  function onSituationChange() {
    if (selectedSituation !== VehicleSituation.BAIXADA) {
      complementValue = "";
    }
  }

  function openDelete(vehicle: Vehicle) {
    selected = vehicle;
    deleteDialog?.showModal();
  }
</script>

<div class="flex flex-col gap-4">
  <PageToolbar
    title="Viaturas"
    newLabel="Nova Viatura"
    onNew={openCreate}
    bind:search
  />

  <DataTable isEmpty={filtered.length === 0}>
    {#snippet head()}
      <SortHeader
        label="Nome"
        field="name"
        sortKey={sorting.key}
        sortDir={sorting.dir}
        onSort={sorting.sortBy}
      />
      <SortHeader
        label="Situação"
        field="situation"
        sortKey={sorting.key}
        sortDir={sorting.dir}
        onSort={sorting.sortBy}
        class="w-32"
      />
      <SortHeader
        label="Complemento"
        field="complement"
        sortKey={sorting.key}
        sortDir={sorting.dir}
        onSort={sorting.sortBy}
      />
      <th class="w-32 text-right">Ações</th>
    {/snippet}

    {#snippet rows()}
      {#each sorting.sorted as vehicle}
        <tr>
          <td class="font-medium">{vehicle.name}</td>
          <td>
            <span
              class="badge badge-sm capitalize font-bold w-16 {vehicle.situation ===
              VehicleSituation.ATIVA
                ? 'badge-success'
                : 'badge-neutral'}"
            >
              {vehicle.situation}
            </span>
          </td>
          <td class="text-base-content/70">{vehicle.complement ?? "—"}</td>
          <td>
            <div class="flex justify-end gap-1">
              <button
                type="button"
                class="btn btn-ghost min-h-11 min-w-11"
                title="Editar"
                aria-label="Editar"
                onclick={() => openEdit(vehicle)}
              >
                <Pencil size={18} />
              </button>
              <button
                type="button"
                class="btn btn-ghost text-error min-h-11 min-w-11"
                title="Excluir"
                aria-label="Excluir"
                onclick={() => openDelete(vehicle)}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </td>
        </tr>
      {/each}
    {/snippet}

    {#snippet cards()}
      {#each sorting.sorted as vehicle}
        <li
          class="flex items-center justify-between rounded-xl border border-base-200 bg-base-100 px-4 py-3"
        >
          <div class="flex items-center gap-3">
            <span
              class="badge capitalize {vehicle.situation ===
              VehicleSituation.ATIVA
                ? 'badge-success'
                : 'badge-neutral'}"
            >
              {vehicle.situation}
            </span>
            <div class="flex flex-col">
              <span class="font-medium text-sm">{vehicle.name}</span>
              {#if vehicle.complement}
                <span class="text-xs text-base-content/60"
                  >{vehicle.complement}</span
                >
              {/if}
            </div>
          </div>
          <div class="flex gap-1">
            <button
              type="button"
              class="btn btn-ghost min-h-11 min-w-11"
              title="Editar"
              aria-label="Editar"
              onclick={() => openEdit(vehicle)}
            >
              <Pencil size={18} />
            </button>
            <button
              type="button"
              class="btn btn-ghost text-error min-h-11 min-w-11"
              title="Excluir"
              aria-label="Excluir"
              onclick={() => openDelete(vehicle)}
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
  title={mode === "create" ? "Nova Viatura" : "Editar Viatura"}
  action={mode === "create" ? "?/create" : "?/update"}
  submitLabel={mode === "create" ? "Criar" : "Salvar alterações"}
>
  {#if mode === "edit" && selected}
    <input type="hidden" name="id" value={selected.id} />
  {/if}

  <label class="flex flex-col gap-1.5">
    <span class="text-sm font-medium text-base-content">Nome</span>
    <input
      type="text"
      name="name"
      class="input input-bordered w-full uppercase"
      placeholder="Ex: ABT-01"
      value={selected?.name ?? ""}
      maxlength="20"
      pattern="[A-Z0-9-]+"
      title="Apenas letras maiúsculas, números e/ou hífen"
      required
    />
  </label>

  <label class="flex flex-col gap-1.5">
    <span class="text-sm font-medium text-base-content">Situação</span>
    <select
      name="situation"
      class="select select-bordered w-full"
      bind:value={selectedSituation}
      onchange={onSituationChange}
      required
    >
      <option value="" disabled>Selecione...</option>
      <option value={VehicleSituation.ATIVA}>Ativa</option>
      <option value={VehicleSituation.BAIXADA}>Baixada</option>
    </select>
  </label>

  <label class="flex flex-col gap-1.5">
    <span class="text-sm font-medium text-base-content"
      >Complemento <span class="text-base-content/50"
        >(apenas para viaturas baixadas)</span
      ></span
    >
    <input
      type="text"
      name="complement"
      class="input input-bordered w-full disabled:bg-base-200 disabled:text-base-content/50"
      placeholder={complementEnabled
        ? "Ex: Oficina - Problema"
        : "Disponível apenas para viaturas baixadas"}
      bind:value={complementValue}
      disabled={!complementEnabled}
      maxlength="100"
      pattern="[a-zA-ZÀ-ÖØ-öø-ÿ0-9\s().,'`\-/]+"
      title="Apenas letras, números, espaços e/ou pontuação"
    />
  </label>
</FormModal>

<ConfirmModal
  bind:dialog={deleteDialog}
  title="Excluir Viatura"
  action="?/delete"
>
  {#snippet formFields()}
    <input type="hidden" name="id" value={selected?.id} />
  {/snippet}

  <p class="text-sm text-base-content">
    Tem certeza que deseja excluir <strong>{selected?.name}</strong>?
  </p>
  <p class="text-sm text-error font-medium">
    * Esta ação não poderá ser desfeita.
  </p>
</ConfirmModal>
