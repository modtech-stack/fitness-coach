"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { href: "/dashboard", label: "Главная" },
  { href: "/today", label: "Сегодня" },
  { href: "/program", label: "Моя программа" },
  { href: "/history", label: "История" },
  { href: "/settings", label: "Настройки" },
] as const;

function isCurrentPath(pathname: string, href: string) {
  if (pathname.startsWith("/workouts/")) {
    const isEditRoute = pathname.endsWith("/edit");
    return isEditRoute ? href === "/program" : href === "/today";
  }

  return pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
}

export function AppNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Основная навигация"
      className="-mx-1 flex w-[calc(100%+0.5rem)] items-center gap-1 overflow-x-auto px-1 pb-1 sm:mx-0 sm:w-auto sm:overflow-visible sm:p-0"
    >
      {navigation.map((item) => {
        const isCurrent = isCurrentPath(pathname, item.href);

        return (
          <Link
            aria-current={isCurrent ? "page" : undefined}
            className={`shrink-0 rounded-lg px-3 py-2 text-sm font-semibold transition ${
              isCurrent
                ? "bg-teal-50 text-teal-800"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
            }`}
            href={item.href}
            key={item.href}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
