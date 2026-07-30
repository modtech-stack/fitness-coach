import Link from "next/link";

import { getHomeActions } from "@/features/home/get-home-actions";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type HomePageProps = {
  searchParams: Promise<{ accountDeleted?: string }>;
};

export default async function Home({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let hasProfile = false;
  let hasGoals = false;
  let isSetupComplete = false;

  if (user) {
    const [{ data: profile }, { count: goalsCount }] =
      await Promise.all([
        supabase
          .from("profiles")
          .select("onboarding_completed_at")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("goals")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
      ]);

    hasProfile = Boolean(profile);
    hasGoals = Boolean(goalsCount);
    isSetupComplete =
      Boolean(profile?.onboarding_completed_at) && hasGoals;
  }

  const actions = getHomeActions({
    isAuthenticated: Boolean(user),
    hasProfile,
    hasGoals,
    isSetupComplete,
  });

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8 sm:px-10">
        <header className="flex items-center justify-between">
          <span className="text-sm font-bold tracking-[0.18em] text-teal-300 uppercase">
            AI Fitness Trainer
          </span>
        </header>

        {params.accountDeleted === "1" ? (
          <p
            className="mt-8 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100"
            role="status"
          >
            Аккаунт и связанные с ним данные удалены.
          </p>
        ) : null}

        <section className="grid flex-1 items-center gap-12 py-20 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="mb-5 text-sm font-semibold text-teal-300">
              Основа первого рабочего продукта
            </p>
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-6xl">
              Начните с профиля, цели и реальных ограничений.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              AI Fitness Trainer сохраняет базовый контекст и защищает
              его на уровне базы данных. Генерация программ и
              автоматическая адаптация появятся на следующих этапах.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              {actions.map((action) => (
                <Link
                  className={
                    action.kind === "primary"
                      ? "primary-button justify-center"
                      : "secondary-button border-slate-700 bg-slate-900 text-white hover:bg-slate-800"
                  }
                  href={action.href}
                  key={action.href}
                >
                  {action.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-7 shadow-2xl shadow-teal-950/30">
            <p className="text-xs font-bold tracking-[0.16em] text-teal-300 uppercase">
              Что доступно сейчас
            </p>
            <ol className="mt-6 space-y-5">
              {[
                [
                  "01",
                  "Регистрация",
                  "Защищённая учётная запись и подтверждение адреса",
                ],
                [
                  "02",
                  "Профиль",
                  "Рост, вес, опыт и повседневная активность",
                ],
                [
                  "03",
                  "Цели",
                  "Основная и второстепенные цели",
                ],
                [
                  "04",
                  "Ограничения",
                  "Только ваши записи, изолированные правилами доступа",
                ],
              ].map(([number, title, description]) => (
                <li className="flex gap-4" key={number}>
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-teal-400/10 text-sm font-bold text-teal-300">
                    {number}
                  </span>
                  <div>
                    <p className="font-semibold text-white">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-400">
                      {description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </div>
    </main>
  );
}
