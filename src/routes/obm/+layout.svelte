<script lang="ts">
  import "../../app.css";
  import AppHeader from "$lib/components/AppHeader.svelte";

  let { children } = $props();
</script>

<div>
  <AppHeader />
  <main class="flex-1 p-4 md:p-6 lg:p-8">
    {@render children()}
  </main>

  <footer class="bg-base-200 p-4 text-center text-sm text-base-content/60">
    ForceMap &copy; {new Date().getFullYear()}
  </footer>
</div>
