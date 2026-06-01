import { ensureAuthenticated, getApiUrl, internalHeaders } from "$lib/server/api";
import { fail, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";

export const actions: Actions = {
  default: async ({ request, cookies, platform, locals }) => {
    if (!locals.user) {
      redirect(303, "/login");
    }

    const apiUrl = getApiUrl(platform);
    const data = await request.formData();
    const currentPassword = data.get("currentPassword") as string;
    const newPassword = data.get("newPassword") as string;
    const confirmPassword = data.get("confirmPassword") as string;

    if (!currentPassword || currentPassword.trim() === "") {
      return fail(400, { message: "A senha atual é obrigatória." });
    }

    if (!newPassword || newPassword.trim() === "") {
      return fail(400, { message: "A nova senha é obrigatória." });
    }

    if (newPassword !== confirmPassword) {
      return fail(400, { message: "A nova senha e a confirmação não coincidem." });
    }

    if (newPassword.length < 8) return fail(400, { message: "A nova senha deve ter pelo menos 8 caracteres." });
    if (!/[A-Z]/.test(newPassword)) return fail(400, { message: "A nova senha deve conter pelo menos 1 letra maiúscula." });
    if (!/[a-z]/.test(newPassword)) return fail(400, { message: "A nova senha deve conter pelo menos 1 letra minúscula." });
    if (!/[0-9]/.test(newPassword)) return fail(400, { message: "A nova senha deve conter pelo menos 1 número." });
    if (!/[!@#$%^&*()_+=[\]{};':"\\|,.<>/?-]/.test(newPassword)) return fail(400, { message: "A nova senha deve conter pelo menos 1 caractere especial." });

    const accessToken = cookies.get("access_token");

    const response = await fetch(`${apiUrl}/user/update-password/${locals.user.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...internalHeaders(platform),
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    ensureAuthenticated(response, cookies);

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return fail(response.status, { message: body.error || "Erro ao alterar a senha." });
    }

    cookies.delete("access_token", { path: "/" });
    cookies.delete("refresh_token", { path: "/" });

    redirect(303, "/login?passwordChanged=true");
  },
};
