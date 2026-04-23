<script lang="ts">
  import ConfirmModal from "$lib/components/ConfirmModal.svelte";
  import DataTable from "$lib/components/DataTable.svelte";
  import FormModal from "$lib/components/FormModal.svelte";
  import PageToolbar from "$lib/components/PageToolbar.svelte";
  import SortHeader from "$lib/components/SortHeader.svelte";
  import { UserRole, type User } from "$lib/types";
  import { createSorting } from "$lib/utils/sorting.svelte";
  import { Shield, Trash2 } from "lucide-svelte";
  import { tick } from "svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  let formDialog = $state<HTMLDialogElement>();
  let deleteDialog = $state<HTMLDialogElement>();
  let selected = $state<User | null>(null);
  let selectedRole = $state<UserRole | "">("");
  let selectedMilitaryId = $state("");
  let mode = $state<"create" | "edit">("create");
  let search = $state("");
  let password = $state("");
  let confirmPasswordEl = $state<HTMLInputElement>();

  function validateConfirm() {
    if (!confirmPasswordEl) return;
    confirmPasswordEl.setCustomValidity(
      confirmPasswordEl.value !== password ? "As senhas não coincidem." : "",
    );
  }

  let usedMilitaryIds = $derived(new Set(data.users.map((u) => u.military.id)));
  let availableMilitary = $derived(
    data.military
      .filter((m) => !usedMilitaryIds.has(m.id))
      .sort((a, b) => a.militaryRank.order - b.militaryRank.order),
  );

  let filtered = $derived(
    search.trim() === ""
      ? data.users
      : data.users.filter(
          (u) =>
            u.military.name.toLowerCase().includes(search.toLowerCase()) ||
            String(u.military.rg).includes(search.trim()) ||
            u.military.militaryRank?.abbreviation
              ?.toLowerCase()
              .includes(search.toLowerCase()) ||
            u.role.toLowerCase().includes(search.toLowerCase()),
        ),
  );

  const sorting = createSorting(() => filtered, {
    key: "military.militaryRank.order",
  });

  function openCreate() {
    selected = null;
    selectedRole = "";
    selectedMilitaryId = "";
    password = "";
    mode = "create";
    formDialog?.showModal();
  }

  async function openEdit(user: User) {
    selected = null;
    selectedRole = "";
    await tick();
    selected = user;
    selectedRole = user.role;
    mode = "edit";
    await tick();
    formDialog?.showModal();
  }

  function openDelete(user: User) {
    selected = user;
    deleteDialog?.showModal();
  }
</script>

<div class="flex flex-col gap-4">
  <PageToolbar
    title="Usuários"
    newLabel="Novo Usuário"
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
        label="Nível de Acesso"
        field="role"
        sortKey={sorting.key}
        sortDir={sorting.dir}
        onSort={sorting.sortBy}
      />
      <th class="text-right">Ações</th>
    {/snippet}

    {#snippet rows()}
      {#each sorting.sorted as user}
        <tr>
          <td>{user.military.militaryRank?.abbreviation}</td>
          <td>{user.military.rg}</td>
          <td>{user.military.name}</td>
          <td>{user.role}</td>
          <td>
            <div class="flex justify-end gap-1">
              <button
                type="button"
                class="btn btn-ghost min-h-11 min-w-11"
                title="Editar nível de acesso"
                aria-label="Editar nível de acesso"
                onclick={() => openEdit(user)}
              >
                <Shield size={18} />
              </button>
              <button
                type="button"
                class="btn btn-ghost text-error min-h-11 min-w-11"
                title="Excluir"
                aria-label="Excluir"
                onclick={() => openDelete(user)}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </td>
        </tr>
      {/each}
    {/snippet}

    {#snippet cards()}
      {#each sorting.sorted as user}
        <li
          class="flex items-center justify-between rounded-xl border border-base-200 bg-base-100 px-4 py-3"
        >
          <div class="flex items-center gap-3">
            <span class="badge badge-neutral"
              >{user.military.militaryRank?.abbreviation}</span
            >
            <div class="flex flex-col">
              <span class="font-medium text-sm">{user.military.name}</span>
              <span class="text-xs text-base-content/60"
                >RG {user.military.rg} · {user.role}</span
              >
            </div>
          </div>
          <div class="flex gap-1">
            <button
              type="button"
              class="btn btn-ghost min-h-11 min-w-11"
              title="Editar nível de acesso"
              aria-label="Editar nível de acesso"
              onclick={() => openEdit(user)}
            >
              <Shield size={18} />
            </button>
            <button
              type="button"
              class="btn btn-ghost text-error min-h-11 min-w-11"
              title="Excluir"
              aria-label="Excluir"
              onclick={() => openDelete(user)}
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
  title={mode === "create" ? "Novo Usuário" : "Editar Nível de Acesso"}
  action={mode === "create" ? "?/create" : "?/updateRole"}
  submitLabel={mode === "create" ? "Criar" : "Salvar alterações"}
>
  {#if mode === "edit" && selected}
    <input type="hidden" name="id" value={selected.id} />
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
  {/if}

  <label class="flex flex-col gap-1.5">
    <span class="text-sm font-medium text-base-content">Nível de Acesso</span>
    <select
      name="role"
      class="select select-bordered w-full"
      bind:value={selectedRole}
      required
    >
      <option value="" disabled>Selecione...</option>
      {#each Object.values(UserRole).filter((r) => r !== UserRole.ADMIN || data.currentUserRole === UserRole.ADMIN) as role}
        <option value={role}>{role}</option>
      {/each}
    </select>
  </label>

  {#if mode === "create"}
    <label class="flex flex-col gap-1.5">
      <span class="text-sm font-medium text-base-content">Senha</span>
      <input
        type="password"
        name="password"
        class="input input-bordered w-full"
        placeholder="Senha de acesso"
        autocomplete="new-password"
        bind:value={password}
        oninput={validateConfirm}
        required
      />
    </label>

    <label class="flex flex-col gap-1.5">
      <span class="text-sm font-medium text-base-content">Confirmar senha</span>
      <input
        type="password"
        class="input input-bordered w-full"
        placeholder="Repita a senha"
        autocomplete="new-password"
        bind:this={confirmPasswordEl}
        oninput={validateConfirm}
        required
      />
    </label>
  {/if}
</FormModal>

<ConfirmModal
  bind:dialog={deleteDialog}
  title="Excluir Usuário"
  action="?/delete"
>
  {#snippet formFields()}
    <input type="hidden" name="id" value={selected?.id} />
  {/snippet}

  <p class="text-sm text-base-content">
    Tem certeza que deseja excluir o usuário de <strong
      >{selected?.military.militaryRank?.abbreviation}
      {selected?.military.name}</strong
    >?
  </p>
  <p class="text-sm text-error font-medium">
    * Esta ação não poderá ser desfeita.
  </p>
</ConfirmModal>
