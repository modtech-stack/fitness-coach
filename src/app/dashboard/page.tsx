import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { signOutAction } from "@/features/auth/actions";
import {
  deleteConstraintAction,
  deleteGoalAction,
} from "@/features/onboarding/actions";
import {
  activityOptions,
  constraintTypeOptions,
  experienceOptions,
  goalPriorityOptions,
  goalStatusOptions,
  goalTypeOptions,
  sexOptions,
} from "@/features/onboarding/schemas";
import { DestructiveActionForm } from "@/features/shared/destructive-action-form";
import { requireUser } from "@/lib/auth/require-user";

export const metadata: Metadata = {
  title: "Профиль",
};

export const dynamic = "force-dynamic";

function toLabel<T extends string | number>(
  options: ReadonlyArray<{ value: T; label: string }>,
  value: T,
) {
  return options.find((option) => option.value === value)?.label ?? value;
}

export default async function DashboardPage() {
  const { user, supabase } = await requireUser();
  const [
    { data: profile, error: profileError },
    { data: goals, error: goalsError },
    { data: constraints, error: constraintsError },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .order("priority"),
    supabase
      .from("constraints")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at"),
  ]);

  if (profileError || goalsError || constraintsError) {
    throw new Error("Не удалось загрузить данные профиля.");
  }

  if (!profile) {
    redirect("/onboarding/profile");
  }

  if (!goals?.length) {
    redirect("/onboarding/goal");
  }

  if (!profile.onboarding_completed_at) {
    redirect("/onboarding/constraints");
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link
            className="text-sm font-bold tracking-[0.14em] text-teal-800 uppercase"
            href="/dashboard"
          >
            AI Fitness Trainer
          </Link>
          <div className="flex items-center gap-4">
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
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-10">
        <div className="mb-8">
          <p className="text-sm font-semibold text-teal-700">
            Основные данные
          </p>
          <h1 className="mt-2 break-words text-3xl font-bold tracking-tight text-slate-950">
            Здравствуйте, {profile.name}
          </h1>
          <p className="mt-2 text-slate-600">
            Первичная настройка завершена. Здесь можно проверять и
            дополнять базовые данные.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="surface-card min-w-0">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-lg font-bold text-slate-950">
                Профиль
              </h2>
              <Link
                className="text-sm font-semibold text-teal-700 hover:text-teal-900"
                href="/onboarding/profile"
              >
                Изменить
              </Link>
            </div>
            <dl className="mt-5 space-y-3 text-sm">
              {[
                ["Электронная почта", user.email ?? "—"],
                ["Дата рождения", profile.birth_date],
                ["Пол", toLabel(sexOptions, profile.sex)],
                ["Рост", `${profile.height_cm} см`],
                ["Вес", `${profile.weight_kg} кг`],
                [
                  "Опыт регулярных тренировок",
                  toLabel(
                    experienceOptions,
                    profile.training_experience,
                  ),
                ],
                [
                  "Активность вне тренировок",
                  toLabel(activityOptions, profile.activity_level),
                ],
              ].map(([term, value]) => (
                <div
                  className="flex justify-between gap-4 border-b border-slate-100 pb-3 last:border-0"
                  key={term}
                >
                  <dt className="min-w-0 text-slate-500">{term}</dt>
                  <dd className="min-w-0 break-words text-right font-medium text-slate-900 [overflow-wrap:anywhere]">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="surface-card min-w-0">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-lg font-bold text-slate-950">
                Цели
              </h2>
              <Link
                className="text-sm font-semibold text-teal-700 hover:text-teal-900"
                href="/onboarding/goal"
              >
                Добавить
              </Link>
            </div>
            <ul className="mt-5 space-y-4">
              {goals.map((goal) => (
                <li
                  className="rounded-xl border border-slate-200 p-4"
                  key={goal.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold text-slate-950">
                      {toLabel(goalTypeOptions, goal.goal_type)}
                    </p>
                    <span className="rounded-full bg-teal-50 px-2 py-1 text-xs font-bold text-teal-800">
                      {toLabel(
                        goalPriorityOptions,
                        goal.priority as 1 | 2,
                      )}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {goal.description}
                  </p>
                  <p className="mt-3 text-xs font-semibold text-slate-500">
                    {toLabel(goalStatusOptions, goal.status)}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-3">
                    <Link
                      className="text-sm font-semibold text-teal-700 hover:text-teal-900"
                      href={`/onboarding/goal?edit=${goal.id}`}
                    >
                      Изменить
                    </Link>
                    <DestructiveActionForm
                      action={deleteGoalAction}
                      confirmMessage="Удалить эту цель? Это действие нельзя отменить."
                      id={goal.id}
                      label="Удалить"
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="surface-card min-w-0">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-lg font-bold text-slate-950">
                Ограничения
              </h2>
              <Link
                className="text-sm font-semibold text-teal-700 hover:text-teal-900"
                href="/onboarding/constraints"
              >
                Добавить
              </Link>
            </div>
            {constraints?.length ? (
              <ul className="mt-5 space-y-4">
                {constraints.map((constraint) => (
                  <li
                    className="rounded-xl border border-slate-200 p-4"
                    key={constraint.id}
                  >
                    <p className="font-semibold text-slate-950">
                      {toLabel(
                        constraintTypeOptions,
                        constraint.type,
                      )}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {constraint.description}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-3">
                      <Link
                        className="text-sm font-semibold text-teal-700 hover:text-teal-900"
                        href={`/onboarding/constraints?edit=${constraint.id}`}
                      >
                        Изменить
                      </Link>
                      <DestructiveActionForm
                        action={deleteConstraintAction}
                        confirmMessage="Удалить это ограничение? Это действие нельзя отменить."
                        id={constraint.id}
                        label="Удалить"
                      />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                Ограничения не добавлены.
              </p>
            )}
          </section>
        </div>

        <aside className="mt-6 rounded-2xl border border-slate-200 bg-white px-6 py-5 text-sm leading-6 text-slate-600">
          На следующем этапе появятся заранее подготовленная
          тренировочная программа и журнал выполнения. Автоматическое
          построение и изменение программ пока не подключены.
        </aside>
      </div>
    </main>
  );
}
