import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AppHeader } from "@/features/shared/app-header";
import { formatLongDate } from "@/features/training/date";
import { PlannedWorkoutEditForm } from "@/features/training/planned-workout-edit-form";
import {
  findWorkout,
  getActiveProgramHierarchy,
} from "@/features/training/queries";
import { requireUser } from "@/lib/auth/require-user";

export const metadata: Metadata = {
  title: "Изменить тренировку",
};

export const dynamic = "force-dynamic";

type WorkoutEditPageProps = {
  params: Promise<{ workoutId: string }>;
};

export default async function WorkoutEditPage({ params }: WorkoutEditPageProps) {
  const [{ workoutId }, { user, supabase }] = await Promise.all([
    params,
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
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-5 sm:py-10">
        <Link
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
          href={`/workouts/${workout.id}`}
        >
          ← Вернуться к тренировке
        </Link>
        <p className="mt-8 text-sm font-semibold text-teal-700">
          {formatLongDate(workout.scheduled_date)}
        </p>
        <h1 className="mt-2 break-words text-3xl font-bold tracking-tight text-slate-950 [overflow-wrap:anywhere]">
          Изменить: {workout.name}
        </h1>

        {workout.session ? (
          <section className="surface-card mt-8">
            <h2 className="text-xl font-bold text-slate-950">
              Тренировка уже выполнена
            </h2>
            <p className="mt-3 leading-7 text-slate-600">
              План и результат этой тренировки сохранены в истории и больше не
              редактируются.
            </p>
            <Link className="secondary-button mt-6" href="/history">
              Открыть историю
            </Link>
          </section>
        ) : (
          <PlannedWorkoutEditForm
            exercises={workout.exercises}
            instructions={workout.instructions}
            workoutId={workout.id}
          />
        )}
      </div>
    </main>
  );
}
