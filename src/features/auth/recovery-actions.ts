"use server";

import { redirect } from "next/navigation";

import {
  newPasswordSchema,
  passwordResetRequestSchema,
} from "@/features/auth/schemas";
import {
  requestPasswordReset,
} from "@/features/auth/password-recovery";
import {
  getFieldErrors,
  type FormState,
} from "@/features/shared/form-state";
import { hasRecoveryAuthenticationMethod } from "@/lib/auth/recovery-session";
import { getRecoveryRedirectUrl } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

function getPasswordUpdateErrorMessage(code?: string): string {
  switch (code) {
    case "weak_password":
      return "Пароль не соответствует требованиям безопасности.";
    case "same_password":
      return "Новый пароль должен отличаться от текущего.";
    default:
      return "Не удалось обновить пароль. Запросите новую ссылку для восстановления.";
  }
}

export async function requestPasswordResetAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = passwordResetRequestSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      errors: getFieldErrors(parsed.error),
    };
  }

  const supabase = await createClient();
  const message = await requestPasswordReset({
    email: parsed.data.email,
    redirectTo: getRecoveryRedirectUrl(),
    send: async (email, redirectTo) => {
      const { error } =
        await supabase.auth.resetPasswordForEmail(email, {
          redirectTo,
        });

      return { error };
    },
  });

  return {
    status: "success",
    message,
  };
}

export async function updatePasswordAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = newPasswordSchema.safeParse({
    password: formData.get("password"),
    passwordConfirmation: formData.get(
      "passwordConfirmation",
    ),
  });

  if (!parsed.success) {
    return {
      status: "error",
      errors: getFieldErrors(parsed.error),
    };
  }

  const supabase = await createClient();
  const { data, error: claimsError } =
    await supabase.auth.getClaims();

  if (
    claimsError ||
    !hasRecoveryAuthenticationMethod(data?.claims)
  ) {
    redirect("/forgot-password?error=invalid-link");
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return {
      status: "error",
      message: getPasswordUpdateErrorMessage(error.code),
    };
  }

  await supabase.auth.signOut({ scope: "global" });
  redirect("/sign-in?passwordUpdated=1");
}
