<script lang="ts">
  import { enhance } from "$app/forms";
  import { Eye, EyeOff } from "lucide-svelte";
  import type { ActionData } from "./$types";

  let { form }: { form: ActionData } = $props();

  let currentPassword = $state("");
  let newPassword = $state("");
  let confirmPasswordEl = $state<HTMLInputElement>();

  let showCurrentPassword = $state(false);
  let showNewPassword = $state(false);
  let showConfirmPassword = $state(false);

  function validateConfirm() {
    if (!confirmPasswordEl) return;
    confirmPasswordEl.setCustomValidity(
      confirmPasswordEl.value !== newPassword ? "As senhas não coincidem." : "",
    );
  }
</script>

<div class="flex flex-col gap-4">
  <div class="card bg-base-100 shadow-xl max-w-md mx-auto w-full mt-4">
    <div class="card-body">
      {#if form?.message}
        <div role="alert" class="alert alert-error text-sm mb-4">
          <span>{form.message}</span>
        </div>
      {/if}

      <form
        method="POST"
        use:enhance={() => {
          return async ({ update }) => {
            await update();
          };
        }}
        class="flex flex-col gap-4"
      >
        <label class="flex flex-col gap-1.5">
          <span class="text-sm font-medium text-base-content">Senha Atual</span>
          <div class="relative w-full">
            <input
              type={showCurrentPassword ? "text" : "password"}
              name="currentPassword"
              class="input input-bordered w-full pr-10"
              placeholder="Digite sua senha atual"
              bind:value={currentPassword}
              required
            />
            <button
              type="button"
              class="absolute inset-y-0 right-0 flex items-center pr-3 text-base-content/60 hover:text-base-content"
              onclick={() => (showCurrentPassword = !showCurrentPassword)}
              aria-label={showCurrentPassword
                ? "Ocultar senha"
                : "Mostrar senha"}
            >
              {#if showCurrentPassword}
                <EyeOff size={18} />
              {:else}
                <Eye size={18} />
              {/if}
            </button>
          </div>
        </label>

        <label class="flex flex-col gap-1.5">
          <span class="text-sm font-medium text-base-content">Nova Senha</span>
          <div class="relative w-full">
            <input
              type={showNewPassword ? "text" : "password"}
              name="newPassword"
              class="input input-bordered w-full pr-10"
              placeholder="Digite a nova senha"
              bind:value={newPassword}
              oninput={validateConfirm}
              minlength="8"
              required
            />
            <button
              type="button"
              class="absolute inset-y-0 right-0 flex items-center pr-3 text-base-content/60 hover:text-base-content"
              onclick={() => (showNewPassword = !showNewPassword)}
              aria-label={showNewPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {#if showNewPassword}
                <EyeOff size={18} />
              {:else}
                <Eye size={18} />
              {/if}
            </button>
          </div>
          <span class="text-xs text-base-content/60">
            Mínimo de 8 caracteres, contendo maiúscula, minúscula, número e
            caractere especial.
          </span>
        </label>

        <label class="flex flex-col gap-1.5">
          <span class="text-sm font-medium text-base-content"
            >Confirmar Nova Senha</span
          >
          <div class="relative w-full">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              class="input input-bordered w-full pr-10"
              placeholder="Repita a nova senha"
              bind:this={confirmPasswordEl}
              oninput={validateConfirm}
              minlength="8"
              required
            />
            <button
              type="button"
              class="absolute inset-y-0 right-0 flex items-center pr-3 text-base-content/60 hover:text-base-content"
              onclick={() => (showConfirmPassword = !showConfirmPassword)}
              aria-label={showConfirmPassword
                ? "Ocultar senha"
                : "Mostrar senha"}
            >
              {#if showConfirmPassword}
                <EyeOff size={18} />
              {:else}
                <Eye size={18} />
              {/if}
            </button>
          </div>
        </label>

        <div class="card-actions justify-end mt-2">
          <button type="submit" class="btn btn-primary w-full">
            Atualizar Senha
          </button>
        </div>
      </form>
    </div>
  </div>
</div>
