import type { Metadata } from "next";
import Link from "next/link";

import { AppHeader } from "@/features/shared/app-header";
import { formatDateTime } from "@/features/training/date";
import { getWorkoutHistory } from "@/features/training/queries";
import { requireUser } from "@/lib/auth/require-user";

export const metadata: Metadata = {
  title: "История тренировок",
};

export const dynamic = "force-dynamic";

type HistoryPageProps = {
  searchParams: Promise<{ completed?: string }>;
};

export default async function HistoryPage({
  searchParams,
}: HistoryPageProps) {
  const [{ user, supabase }, query] = await Promise.all([
    requireUser(),
    searchParams,
  ]);
  const history = await getWorkoutHistory(supabase, user.id);

  return (
    <main className="min-h-screen bg-slate-100">
      <AppHeader />
      <div className="mx-auto max-w-4xl px-5 py-10">
        <p className="text-sm font-semibold text-teal-700">
          Фактические результаты
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          История тренировок
        </h1>

        {query.completed === "1" ? (
          <p
            className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
            role="status"
          >
            Тренировка завершена. Подходы, RPE и комментарий сохранены.
          </p>
        ) : null}

        {!history.length ? (
          <section className="surface-card mt-8">
            <h2 className="text-xl font-bold text-slate-950">
              Выполненных тренировок пока нет
            </h2>
            <p className="mt-3 leading-7 text-slate-600">
              Откройте сегодняшнюю тренировку, запишите фактические подходы и
              завершите её — результат появится здесь.
            </p>
            <Link className="primary-button mt-6" href="/today">
              Перейти к сегодняшней тренировке
            </Link>
          </section>
        ) : (
          <div className="mt-8 space-y-6">
            {history.map(({ session, workout, exercises }) => (
              <article className="surface-card" key={session.id}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-950">
                      {workout.name}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {session.completed_at
                        ? formatDateTime(session.completed_at)
                        : "Дата не указана"}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800">
                    Выполнена
                  </span>
                </div>

                <div className="mt-6 space-y-5">
                  {exercises.map(({ exercise, actualSets }) => (
                    <section key={exercise.id}>
                      <h3 className="font-bold text-slate-900">
                        {exercise.name}
                      </h3>
                      {actualSets.length ? (
                        <ul className="mt-2 flex flex-wrap gap-2">
                          {actualSets.map((actualSet) => (
                            <li
                              className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700"
                              key={actualSet.id}
                            >
                              {actualSet.set_number}-й: {actualSet.reps} повт.
                              {actualSet.weight_kg !== null
                                ? ` × ${actualSet.weight_kg} кг`
                                : ""}
                              {` · RPE ${actualSet.rpe}`}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 text-sm text-slate-500">
                          Подходы не записаны.
                        </p>
                      )}
                    </section>
                  ))}
                </div>

                {session.comment ? (
                  <p className="mt-6 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                    <span className="font-bold text-slate-800">Комментарий:</span>{" "}
                    {session.comment}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
