<script lang="ts">
  import "../../app.css";
  import AppShell from "$lib/components/AppShell.svelte";
  import type { LayoutProps } from "./$types";

  let { children, data }: LayoutProps = $props();
</script>

<AppShell user={data.user}>
  <main class="flex-1 p-4 md:p-6 lg:p-8">
    {@render children()}
  </main>

  <footer class="bg-primary text-primary-content p-4 text-center text-sm">
    ForceMap &copy; {new Date().getFullYear()}
  </footer>
</AppShell>
