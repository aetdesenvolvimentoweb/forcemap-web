<script lang="ts">
  import { enhance } from "$app/forms";
  import type { Snippet } from "svelte";

  let {
    dialog = $bindable<HTMLDialogElement | undefined>(),
    title,
    action,
    submitLabel = "Salvar",
    children,
  }: {
    dialog?: HTMLDialogElement;
    title: string;
    action: string;
    submitLabel?: string;
    children: Snippet;
  } = $props();
</script>

<dialog bind:this={dialog} class="modal">
  <div class="modal-box p-0 overflow-hidden">
    <div class="bg-primary text-primary-content px-6 py-4 flex items-center justify-between">
      <h3 class="text-base font-semibold tracking-wide">{title}</h3>
      <button type="button" class="btn btn-ghost btn-sm btn-circle" onclick={() => dialog?.close()}>✕</button>
    </div>

    <form
      method="POST"
      {action}
      use:enhance={() => async ({ update }) => {
        await update();
        dialog?.close();
      }}
    >
      <div class="flex flex-col gap-5 px-6 py-6">
        {@render children()}
      </div>

      <div class="flex justify-end gap-2 px-6 py-4 border-t border-base-200 bg-base-200/40">
        <button type="button" class="btn btn-ghost btn-sm" onclick={() => dialog?.close()}>Cancelar</button>
        <button type="submit" class="btn btn-primary btn-sm">{submitLabel}</button>
      </div>
    </form>
  </div>
  <form method="dialog" class="modal-backdrop"><button>fechar</button></form>
</dialog>
