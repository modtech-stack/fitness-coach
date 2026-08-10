import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AppHeader } from "@/features/shared/app-header";
import { formatLongDate } from "@/features/training/date";
import {
  findWorkout,
  getActiveProgramHierarchy,
} from "@/features/training/queries";
import { WorkoutCompletionForm } from "@/features/training/workout-completion-form";
import { requireUser } from "@/lib/auth/require-user";

export const metadata: Metadata = {
  title: "Тренировка",
};

export const dynamic = "force-dynamic";

type WorkoutPageProps = {
  params: Promise<{ workoutId: string }>;
  searchParams: Promise<{ updated?: string }>;
};

export default async function WorkoutPage({ params, searchParams }: WorkoutPageProps) {
  const [{ workoutId }, query, { user, supabase }] = await Promise.all([
    params,
    searchParams,
    requireUser(),
  ]);
  const program = await getActiveProgramHierarchy(supabase, user.id);
  const workout = program ? findWorkout(program, workoutId) : null;

  if (!workout) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <AppHeader />
      <div className="mx-auto max-w-4xl px-4 py-8 pb-28 sm:px-5 sm:py-10 sm:pb-28">
        <Link
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
          href="/program"
        >
          ← Вернуться к программе
        </Link>
        <p className="mt-8 text-sm font-semibold text-teal-700">
          {formatLongDate(workout.scheduled_date)} · {workout.estimated_minutes} мин
        </p>
        <h1 className="mt-2 break-words text-3xl font-bold tracking-tight text-slate-950 [overflow-wrap:anywhere]">
          {workout.name}
        </h1>
        <p className="mt-3 text-lg text-slate-600">{workout.focus}</p>
        <p className="mt-5 rounded-xl border border-slate-200 bg-white p-4 leading-7 text-slate-600">
          {workout.instructions}
        </p>

        {query.updated === "1" ? (
          <p
            className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
            role="status"
          >
            Изменения тренировки сохранены.
          </p>
        ) : null}

        {workout.session ? (
          <section className="surface-card mt-8">
            <h2 className="text-xl font-bold text-emerald-900">
              Тренировка выполнена
            </h2>
            <p className="mt-2 text-slate-600">
              Результаты сохранены в истории. Повторное завершение этой
              тренировки недоступно.
            </p>
            <Link className="secondary-button mt-6" href="/history">
              Открыть историю
            </Link>
          </section>
        ) : workout.exercises.length ? (
          <>
            <div className="mt-6">
              <Link
                className="secondary-button"
                href={`/workouts/${workout.id}/edit`}
              >
                Изменить тренировку
              </Link>
            </div>
            <WorkoutCompletionForm
              exercises={workout.exercises}
              workoutId={workout.id}
            />
          </>
        ) : (
          <p className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
            В этой тренировке пока нет упражнений. Завершить её нельзя.
          </p>
        )}
      </div>
    </main>
  );
}
