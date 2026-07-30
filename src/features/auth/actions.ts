"use server";

import { redirect } from "next/navigation";

import { credentialsSchema } from "@/features/auth/schemas";
import {
  getFieldErrors,
  type FormState,
} from "@/features/shared/form-state";
import {
  getSafeNextPath,
  getSiteUrl,
} from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

function getAuthErrorMessage(code?: string): string {
  switch (code) {
    case "email_exists":
    case "user_already_exists":
      return "Аккаунт с таким адресом уже существует.";
    case "invalid_credentials":
      return "Неверная электронная почта или пароль.";
    case "weak_password":
      return "Пароль не соответствует требованиям безопасности.";
    default:
      return "Не удалось выполнить операцию. Попробуйте ещё раз.";
  }
}

export async function signUpAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      errors: getFieldErrors(parsed.error),
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    ...parsed.data,
    options: {
      emailRedirectTo: `${getSiteUrl()}/auth/confirm?next=/dashboard`,
    },
  });

  if (error) {
    return {
      status: "error",
      message: getAuthErrorMessage(error.code),
    };
  }

  if (!data.session) {
    return {
      status: "success",
      message:
        "Аккаунт создан. Подтвердите адрес по ссылке из письма, затем войдите.",
    };
  }

  redirect("/dashboard");
}

export async function signInAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      errors: getFieldErrors(parsed.error),
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return {
      status: "error",
      message: getAuthErrorMessage(error.code),
    };
  }

  redirect(getSafeNextPath(formData.get("next")));
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
