import type { Metadata } from "next";

import { AuthForm } from "@/features/auth/auth-form";
import { getSafeNextPath } from "@/lib/env";

export const metadata: Metadata = {
  title: "Вход",
};

type SignInPageProps = {
  searchParams: Promise<{
    next?: string;
    error?: string;
  }>;
};

export default async function SignInPage({
  searchParams,
}: SignInPageProps) {
  const params = await searchParams;

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight text-slate-950">
        Войти
      </h1>
      <p className="mt-2 mb-7 text-sm leading-6 text-slate-600">
        Продолжите первичную настройку или откройте сохранённый профиль.
      </p>
      {params.error ? (
        <p
          className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
          role="alert"
        >
          Ссылка подтверждения недействительна или устарела.
        </p>
      ) : null}
      <AuthForm
        mode="sign-in"
        nextPath={getSafeNextPath(params.next)}
      />
    </>
  );
}
