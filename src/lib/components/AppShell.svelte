<script lang="ts">
  import type { Military } from "$lib/types";

  let { children, user }: { children?: () => any; user: Military } = $props();
  let menuOpen = $state(false);

  const navItems = [
    { label: "Postos/Graduações", href: "/obm/postos-graduacoes" },
    { label: "Efetivo", href: "/obm/efetivo" },
    { label: "Viaturas", href: "/obm/viaturas" },
  ];
</script>

<div class="drawer">
  <input
    id="mobile-drawer"
    type="checkbox"
    class="drawer-toggle"
    bind:checked={menuOpen}
  />

  <div class="drawer-content flex min-h-screen flex-col">
    <header
      class="navbar bg-primary text-primary-content px-4 sticky top-0 z-10 md:min-h-36"
    >
      <!-- Logo -->
      <div class="flex-1 md:flex-none">
        <a href="/obm" class="btn btn-ghost gap-2 px-2">
          <img
            src="/images/logo.png"
            alt="ForceMap"
            class="md:h-32 w-auto hidden md:block drop-shadow-[0_2px_6px_rgba(255,255,255,0.6)]"
          />
          <span class="text-lg font-bold tracking-tight text-white md:hidden"
            >ForceMap</span
          >
        </a>
      </div>

      <!-- Mobile: sanduíche -->
      <div class="flex-none md:hidden">
        <label for="mobile-drawer" class="btn btn-ghost btn-circle">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </label>
      </div>

      <!-- Desktop: itens centralizados -->
      <nav class="hidden md:flex flex-1 justify-center gap-1">
        {#each navItems as item}
          <a href={item.href} class="btn btn-ghost btn-sm">{item.label}</a>
        {/each}
      </nav>

      <!-- Desktop: avatar dropdown -->
      <div class="hidden md:flex items-center gap-2">
        <div class="dropdown dropdown-end">
          <div tabindex="0" role="button" class="btn btn-ghost btn-circle">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
          <ul
            tabindex="0"
            class="menu menu-sm dropdown-content bg-base-100 rounded-box shadow z-10 mt-3 w-56 p-2"
          >
            <li class="menu-title text-base-content">
              {user.militaryRank?.abbreviation}
              {user.name}
            </li>
            <div class="divider my-0"></div>
            <li><a href="/obm/alterar-senha">Alterar senha</a></li>
            <li><a href="/logout" class="text-error">Sair</a></li>
          </ul>
        </div>
      </div>
    </header>
    {@render children?.()}
  </div>

  <!-- Mobile: menu lateral -->
  <div class="drawer-side z-20">
    <label for="mobile-drawer" aria-label="Fechar menu" class="drawer-overlay"
    ></label>
    <aside class="bg-base-100 min-h-full w-64 p-4 flex flex-col gap-2">
      <a
        href="/obm"
        class="flex flex-col justify-center items-center gap-3 mb-4"
      >
        <img src="/images/logo.jpeg" alt="ForceMap" class="h-32 w-auto" />
        <span class="text-xl font-bold tracking-tight text-primary"
          >ForceMap</span
        >
      </a>
      <ul class="menu w-full p-0">
        {#each navItems as item}
          <li>
            <a href={item.href} onclick={() => (menuOpen = false)}
              >{item.label}</a
            >
          </li>
        {/each}
      </ul>

      <div class="divider my-1"></div>

      <ul class="menu w-full p-0">
        <li>
          <a href="/obm/alterar-senha" onclick={() => (menuOpen = false)}
            >Alterar senha</a
          >
        </li>
        <li>
          <a href="/logout" class="text-error">Sair</a>
        </li>
      </ul>
    </aside>
  </div>
</div>
