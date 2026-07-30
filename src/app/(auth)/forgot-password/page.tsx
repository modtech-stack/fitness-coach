import type { Metadata } from "next";

import { PasswordResetRequestForm } from "@/features/auth/password-reset-request-form";

export const metadata: Metadata = {
  title: "Восстановление пароля",
};

type ForgotPasswordPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function ForgotPasswordPage({
  searchParams,
}: ForgotPasswordPageProps) {
  const params = await searchParams;

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight text-slate-950">
        Восстановить пароль
      </h1>
      <p className="mt-2 mb-7 text-sm leading-6 text-slate-600">
        Укажите адрес электронной почты, использованный при
        регистрации.
      </p>
      {params.error ? (
        <p
          className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
          role="alert"
        >
          Ссылка для восстановления недействительна, устарела или
          уже была использована. Запросите новую ссылку.
        </p>
      ) : null}
      <PasswordResetRequestForm />
    </>
  );
}
