"use server";

import { redirect } from "next/navigation";

import { accountDeletionSchema } from "@/features/account/schemas";
import { deleteCurrentAccount } from "@/features/account/delete-current-account";
import {
  getFieldErrors,
  type FormState,
} from "@/features/shared/form-state";
import { requireUser } from "@/lib/auth/require-user";
import { createAdminClient } from "@/lib/supabase/admin";

export async function deleteAccountAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = accountDeletionSchema.safeParse({
    confirmation: formData.get("confirmation"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      errors: getFieldErrors(parsed.error),
    };
  }

  const { user, supabase } = await requireUser();
  const admin = createAdminClient();
  const deleted = await deleteCurrentAccount({
    userId: user.id,
    deleteUser: (userId) =>
      admin.auth.admin.deleteUser(userId),
    signOut: () => supabase.auth.signOut({ scope: "local" }),
  });

  if (!deleted) {
    return {
      status: "error",
      message:
        "Не удалось удалить аккаунт. Ваши данные не изменены. Попробуйте ещё раз.",
    };
  }

  redirect("/?accountDeleted=1");
}
