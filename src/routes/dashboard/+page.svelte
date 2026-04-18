<script lang="ts">
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
</script>

<h1>Bem-vindo, {data.user?.role}</h1>
<form method="POST" action="?/logout">
  <button
    class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    type="submit"
  >
    Sair
  </button>
</form>
