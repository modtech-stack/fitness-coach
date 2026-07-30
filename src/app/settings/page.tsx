import type { Metadata } from "next";
import Link from "next/link";

import { AccountDeletionForm } from "@/features/account/account-deletion-form";
import { signOutAction } from "@/features/auth/actions";
import { requireUser } from "@/lib/auth/require-user";

export const metadata: Metadata = {
  title: "Настройки",
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { user } = await requireUser();

  return (
    <main className="min-h-screen bg-slate-100 px-5 py-10">
      <div className="mx-auto max-w-2xl">
        <Link
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
          href="/dashboard"
        >
          ← Вернуться на главную
        </Link>

        <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-950">
          Управление аккаунтом
        </h1>
        <p className="mt-2 text-slate-600">
          Данные учётной записи, выход и полное удаление аккаунта.
        </p>

        <section className="surface-card mt-8">
          <h2 className="text-xl font-bold text-slate-950">
            Учётная запись
          </h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex flex-wrap justify-between gap-3 border-b border-slate-100 pb-3">
              <dt className="text-slate-500">
                Электронная почта
              </dt>
              <dd className="min-w-0 break-words text-right font-medium text-slate-900 [overflow-wrap:anywhere]">
                {user.email ?? "—"}
              </dd>
            </div>
          </dl>
          <form action={signOutAction} className="mt-5">
            <button
              className="secondary-button"
              type="submit"
            >
              Выйти из аккаунта
            </button>
          </form>
        </section>

        <section className="mt-6 rounded-2xl border border-rose-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-bold text-rose-900">
            Удалить аккаунт
          </h2>
          <p className="mt-3 leading-7 text-slate-700">
            Аккаунт и все связанные с ним данные будут удалены без
            возможности восстановления.
          </p>
          <AccountDeletionForm />
        </section>
      </div>
    </main>
  );
}
