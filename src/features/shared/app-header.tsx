import Link from "next/link";

import { signOutAction } from "@/features/auth/actions";

const navigation = [
  { href: "/dashboard", label: "Главная" },
  { href: "/today", label: "Сегодня" },
  { href: "/program", label: "Моя программа" },
  { href: "/history", label: "История" },
] as const;

export function AppHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4">
        <Link
          className="text-sm font-bold tracking-[0.14em] text-teal-800 uppercase"
          href="/dashboard"
        >
          AI Fitness Trainer
        </Link>
        <nav
          aria-label="Основная навигация"
          className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2"
        >
          {navigation.map((item) => (
            <Link
              className="text-sm font-semibold text-slate-600 hover:text-slate-950"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
          <Link
            className="text-sm font-semibold text-slate-600 hover:text-slate-950"
            href="/settings"
          >
            Настройки
          </Link>
          <form action={signOutAction}>
            <button
              className="text-sm font-semibold text-slate-600 hover:text-slate-950"
              type="submit"
            >
              Выйти
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
