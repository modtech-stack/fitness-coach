import Link from "next/link";

import { signOutAction } from "@/features/auth/actions";
import { AppNavigation } from "@/features/shared/app-navigation";
import { FeedbackWidget } from "@/features/shared/feedback-widget";

export function AppHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-4">
        <Link
          className="text-sm font-bold tracking-[0.14em] text-teal-800 uppercase"
          href="/dashboard"
        >
          AI Fitness Trainer
        </Link>
        <div className="order-2 flex items-center gap-3 sm:order-3">
          <form action={signOutAction}>
            <button
              className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-950"
              type="submit"
            >
              Выйти
            </button>
          </form>
        </div>
        <div className="order-3 w-full sm:order-2 sm:w-auto">
          <AppNavigation />
        </div>
      </div>
      <FeedbackWidget />
    </header>
  );
}
