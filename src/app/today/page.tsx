import type { Metadata } from "next";
import Link from "next/link";

import { AppHeader } from "@/features/shared/app-header";
import { formatLongDate, getTodayDate } from "@/features/training/date";
import { getActiveProgramHierarchy } from "@/features/training/queries";
import { requireUser } from "@/lib/auth/require-user";

export const metadata: Metadata = {
  title: "Сегодняшняя тренировка",
};

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const { user, supabase } = await requireUser();
  const program = await getActiveProgramHierarchy(supabase, user.id);
  const today = getTodayDate();
  const workout = program?.phases
    .flatMap((phase) => phase.weeks)
    .flatMap((week) => week.workouts)
    .find((item) => item.scheduled_date === today);

  return (
    <main className="min-h-screen bg-slate-100">
      <AppHeader />
      <div className="mx-auto max-w-3xl px-5 py-10">
        <p className="text-sm font-semibold text-teal-700">
          {formatLongDate(today)}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Сегодняшняя тренировка
        </h1>

        {!program ? (
          <section className="surface-card mt-8">
            <h2 className="text-xl font-bold text-slate-950">
              Сначала добавьте программу
            </h2>
            <p className="mt-3 leading-7 text-slate-600">
              После этого здесь появится ближайшая тренировка и её упражнения.
            </p>
            <Link className="primary-button mt-6" href="/program">
              Перейти к программе
            </Link>
          </section>
        ) : !workout ? (
          <section className="surface-card mt-8">
            <h2 className="text-xl font-bold text-slate-950">
              На сегодня тренировки нет
            </h2>
            <p className="mt-3 leading-7 text-slate-600">
              Можно посмотреть весь план и выбрать следующую тренировку.
            </p>
            <Link className="secondary-button mt-6" href="/program">
              Открыть программу
            </Link>
          </section>
        ) : (
          <section className="surface-card mt-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-950">
                  {workout.name}
                </h2>
                <p className="mt-2 text-slate-600">{workout.focus}</p>
              </div>
              <span className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-800">
                {workout.estimated_minutes} мин
              </span>
            </div>
            <p className="mt-5 leading-7 text-slate-600">
              {workout.instructions}
            </p>
            <ul className="mt-6 divide-y divide-slate-100 rounded-xl border border-slate-200">
              {workout.exercises.map((exercise) => (
                <li className="flex justify-between gap-4 p-4" key={exercise.id}>
                  <span className="font-semibold text-slate-900">
                    {exercise.exercise_order}. {exercise.name}
                  </span>
                  <span className="text-right text-sm text-slate-500">
                    {exercise.planned_sets} × {exercise.planned_reps}
                  </span>
                </li>
              ))}
            </ul>
            {workout.session ? (
              <div className="mt-6">
                <p className="font-semibold text-emerald-800">
                  Тренировка выполнена и сохранена.
                </p>
                <Link className="secondary-button mt-4" href="/history">
                  Посмотреть историю
                </Link>
              </div>
            ) : (
              <Link
                className="primary-button mt-6"
                href={`/workouts/${workout.id}`}
              >
                Открыть тренировку
              </Link>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
