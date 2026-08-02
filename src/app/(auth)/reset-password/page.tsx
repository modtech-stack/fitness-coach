import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { NewPasswordForm } from "@/features/auth/new-password-form";
import { hasRecoveryAuthenticationMethod } from "@/lib/auth/recovery-session";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Новый пароль",
};

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (
    error ||
    !hasRecoveryAuthenticationMethod(data?.claims)
  ) {
    redirect("/forgot-password?error=invalid-link");
  }

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight text-slate-950">
        Установить новый пароль
      </h1>
      <p className="mt-2 mb-7 text-sm leading-6 text-slate-600">
        Придумайте новый пароль для своей учётной записи.
      </p>
      <NewPasswordForm />
    </>
  );
}
