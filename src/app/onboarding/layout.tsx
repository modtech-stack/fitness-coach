import Link from "next/link";

import { signOutAction } from "@/features/auth/actions";
import { FeedbackWidget } from "@/features/shared/feedback-widget";
import { requireUser } from "@/lib/auth/require-user";

export const dynamic = "force-dynamic";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireUser();

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
          <Link
            className="text-sm font-bold tracking-[0.14em] text-teal-800 uppercase"
            href="/"
          >
            AI Fitness Trainer
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-slate-500 sm:inline">
              {user.email}
            </span>
            <form action={signOutAction}>
              <button
                className="text-sm font-semibold text-slate-600 hover:text-slate-950"
                type="submit"
              >
                Выйти
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-5 py-10">{children}</div>
      <FeedbackWidget />
    </main>
  );
}
