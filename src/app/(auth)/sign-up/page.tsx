import type { Metadata } from "next";

import { AuthForm } from "@/features/auth/auth-form";

export const metadata: Metadata = {
  title: "Регистрация",
};

export default function SignUpPage() {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight text-slate-950">
        Создать аккаунт
      </h1>
      <p className="mt-2 mb-7 text-sm leading-6 text-slate-600">
        После регистрации вы последовательно заполните профиль, цель и
        ограничения.
      </p>
      <AuthForm mode="sign-up" />
    </>
  );
}
