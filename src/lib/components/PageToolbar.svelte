<script lang="ts">
  let {
    title,
    newLabel,
    onNew,
    search = $bindable(""),
  }: {
    title: string;
    newLabel: string;
    onNew: () => void;
    search?: string;
  } = $props();
</script>

<div class="flex flex-col gap-4">
  <h2 class="text-lg font-bold md:text-xl">{title}</h2>
  <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-2xl border-2 border-base-200 p-4">
    <button type="button" class="btn btn-primary w-full sm:w-auto" onclick={onNew}>
      {newLabel}
    </button>
    <input
      type="text"
      class="input input-bordered w-full sm:w-64"
      placeholder="Pesquisar..."
      bind:value={search}
    />
  </div>
</div>
