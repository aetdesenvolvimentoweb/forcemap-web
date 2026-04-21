<script lang="ts">
  import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-svelte";

  let {
    label,
    field,
    sortKey,
    sortDir,
    onSort,
    class: cls = "",
  }: {
    label: string;
    field: string;
    sortKey: string | null;
    sortDir: "asc" | "desc";
    onSort: (field: string) => void;
    class?: string;
  } = $props();

  const active = $derived(sortKey === field);
</script>

<th
  class="cursor-pointer select-none hover:bg-base-200/60 transition-colors {cls}"
  onclick={() => onSort(field)}
>
  <div class="flex items-center gap-1">
    {label}
    {#if active}
      {#if sortDir === "asc"}
        <ChevronUp size={14} />
      {:else}
        <ChevronDown size={14} />
      {/if}
    {:else}
      <ChevronsUpDown size={14} class="opacity-30" />
    {/if}
  </div>
</th>
