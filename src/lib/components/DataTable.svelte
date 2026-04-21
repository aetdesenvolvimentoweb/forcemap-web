<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    head,
    rows,
    cards,
    isEmpty = false,
    empty = "Nenhum registro encontrado.",
  }: {
    head: Snippet;
    rows: Snippet;
    cards: Snippet;
    isEmpty?: boolean;
    empty?: string;
  } = $props();
</script>

<!-- Mobile: cards -->
<ul class="flex flex-col gap-2 md:hidden">
  {#if isEmpty}
    <li class="rounded-xl border border-base-200 bg-base-100 px-4 py-6 text-center text-sm text-base-content/50">
      {empty}
    </li>
  {:else}
    {@render cards()}
  {/if}
</ul>

<!-- Desktop: tabela -->
<div class="hidden md:block overflow-x-auto rounded-xl border border-base-200">
  <table class="table table-zebra w-full">
    <thead>
      <tr>{@render head()}</tr>
    </thead>
    <tbody>
      {#if isEmpty}
        <tr>
          <td colspan="99" class="py-8 text-center text-sm text-base-content/50">{empty}</td>
        </tr>
      {:else}
        {@render rows()}
      {/if}
    </tbody>
  </table>
</div>
