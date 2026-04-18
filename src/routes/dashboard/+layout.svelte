<script lang="ts">
  import favicon from "$lib/assets/favicon.svg";
  import "../../app.css";

  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<div class="flex min-h-screen flex-col">
  <header class="bg-base-300 p-4 w-full">
    <h1 class="text-lg font-bold md:text-xl">Cabeçalho vai aqui</h1>
  </header>

  <main class="flex-1 p-4 md:p-6 lg:p-8">
    {@render children()}
  </main>

  <footer class="bg-base-300 p-4 w-full text-center text-sm">
    <p>Rodapé vai aqui</p>
  </footer>
</div>
