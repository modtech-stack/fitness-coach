import type { Metadata } from "next";
import Link from "next/link";

import { AppHeader } from "@/features/shared/app-header";
import { createStarterProgramAction } from "@/features/training/actions";
import {
  formatLongDate,
  formatShortDate,
} from "@/features/training/date";
import { getActiveProgramHierarchy } from "@/features/training/queries";
import { requireUser } from "@/lib/auth/require-user";

export const metadata: Metadata = {
  title: "Моя программа",
};

export const dynamic = "force-dynamic";

type ProgramPageProps = {
  searchParams: Promise<{
    created?: string;
    error?: string;
  }>;
};

export default async function ProgramPage({
  searchParams,
}: ProgramPageProps) {
  const [{ user, supabase }, query] = await Promise.all([
    requireUser(),
    searchParams,
  ]);
  const program = await getActiveProgramHierarchy(supabase, user.id);

  return (
    <main className="min-h-screen bg-slate-100">
      <AppHeader />
      <div className="mx-auto max-w-5xl px-5 py-10">
        <p className="text-sm font-semibold text-teal-700">
          План тренировок
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Моя программа
        </h1>

        {query.created === "1" ? (
          <p
            className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
            role="status"
          >
            Подготовленная программа добавлена. Сегодняшнюю тренировку уже
            можно открыть.
          </p>
        ) : null}
        {query.error === "create" ? (
          <p
            className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
            role="alert"
          >
            Не удалось добавить программу. Проверьте, что первичная настройка
            завершена, и попробуйте ещё раз.
          </p>
        ) : null}

        {!program ? (
          <section className="surface-card mt-8">
            <h2 className="text-xl font-bold text-slate-950">
              Активной программы пока нет
            </h2>
            <p className="mt-3 max-w-2xl leading-7 text-slate-600">
              Для проверки ручного тренировочного цикла можно добавить
              подготовленную двухнедельную программу. Она не создаётся GPT и не
              меняется автоматически.
            </p>
            <form action={createStarterProgramAction} className="mt-6">
              <button className="primary-button" type="submit">
                Добавить подготовленную программу
              </button>
            </form>
          </section>
        ) : (
          <>
            <section className="surface-card mt-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-950">
                    {program.name}
                  </h2>
                  <p className="mt-2 max-w-3xl leading-7 text-slate-600">
                    {program.description}
                  </p>
                </div>
                <span className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-800">
                  Активна
                </span>
              </div>
              <p className="mt-5 text-sm font-semibold text-slate-500">
                {formatLongDate(program.start_date)} — {formatLongDate(program.end_date)}
              </p>
            </section>

            <div className="mt-8 space-y-8">
              {program.phases.map((phase) => (
                <section key={phase.id}>
                  <p className="text-sm font-semibold text-teal-700">
                    Фаза {phase.phase_number}
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-950">
                    {phase.name}
                  </h2>
                  <p className="mt-2 text-slate-600">{phase.description}</p>

                  <div className="mt-5 grid gap-5 md:grid-cols-2">
                    {phase.weeks.map((week) => (
                      <article className="surface-card" key={week.id}>
                        <h3 className="text-lg font-bold text-slate-950">
                          Неделя {week.week_number}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {formatShortDate(week.start_date)} — {formatShortDate(week.end_date)}
                        </p>
                        <ul className="mt-5 space-y-4">
                          {week.workouts.map((workout) => (
                            <li
                              className="rounded-xl border border-slate-200 p-4"
                              key={workout.id}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="font-bold text-slate-950">
                                    {workout.name}
                                  </p>
                                  <p className="mt-1 text-sm text-slate-600">
                                    {formatShortDate(workout.scheduled_date)} · {workout.estimated_minutes} мин
                                  </p>
                                </div>
                                <span
                                  className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                                    workout.session
                                      ? "bg-emerald-50 text-emerald-800"
                                      : "bg-slate-100 text-slate-600"
                                  }`}
                                >
                                  {workout.session ? "Выполнена" : "Запланирована"}
                                </span>
                              </div>
                              <p className="mt-3 text-sm leading-6 text-slate-600">
                                {workout.focus}
                              </p>
                              <Link
                                className="mt-4 inline-flex text-sm font-semibold text-teal-700 hover:text-teal-900"
                                href={`/workouts/${workout.id}`}
                              >
                                {workout.session ? "Посмотреть результат" : "Открыть тренировку"}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
