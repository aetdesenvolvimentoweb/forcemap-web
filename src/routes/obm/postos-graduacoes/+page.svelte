<script lang="ts">
  import { Pencil, Trash2 } from "lucide-svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

<div class="flex flex-col gap-4">
  <h2 class="text-lg font-bold md:text-xl">Postos/Graduações</h2>

  <div
    class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-2xl border-2 border-base-200 p-4"
  >
    <button type="button" class="btn btn-primary w-full sm:w-auto">
      Novo Posto/Graduação
    </button>
    <input
      type="text"
      class="input input-bordered w-full sm:w-64"
      placeholder="Pesquisar..."
    />
  </div>

  <!-- Mobile: cards -->
  <ul class="flex flex-col gap-2 md:hidden">
    {#each data.ranks as rank}
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
          >
            <Pencil size={18} />
          </button>
          <button
            type="button"
            class="btn btn-ghost text-error min-h-11 min-w-11"
            title="Excluir"
            aria-label="Excluir"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </li>
    {/each}
  </ul>

  <!-- Desktop: tabela -->
  <div
    class="hidden md:block overflow-x-auto rounded-xl border border-base-200"
  >
    <table class="table table-zebra w-full">
      <thead>
        <tr>
          <th class="w-16">Ordem</th>
          <th>Posto/Graduação</th>
          <th class="w-32 text-right">Ações</th>
        </tr>
      </thead>
      <tbody>
        {#each data.ranks as rank}
          <tr>
            <td>{rank.order}º</td>
            <td>{rank.abbreviation}</td>
            <td class="text-right">
              <div class="flex justify-end gap-1">
                <button
                  type="button"
                  class="btn btn-ghost min-h-11 min-w-11"
                  title="Editar"
                  aria-label="Editar"
                >
                  <Pencil size={18} />
                </button>
                <button
                  type="button"
                  class="btn btn-ghost text-error min-h-11 min-w-11"
                  title="Excluir"
                  aria-label="Excluir"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
