<script lang="ts">
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
</script>

<div class="space-y-4">
  <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
    <h2 class="text-xl font-bold md:text-2xl">
      Bem-vindo, <span class="badge badge-primary badge-lg">{data.user?.role}</span>
    </h2>

    <form method="POST" action="?/logout">
      <button class="btn btn-error btn-outline btn-sm w-full sm:w-auto" type="submit">
        Sair
      </button>
    </form>
  </div>
</div>
