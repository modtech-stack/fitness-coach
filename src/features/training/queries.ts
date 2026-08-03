import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  ActualSet,
  Database,
  PlannedExercise,
  PlannedWorkout,
  ProgramPhase,
  ProgramWeek,
  TrainingProgram,
  WorkoutSession,
} from "@/types/database";

type TrainingClient = SupabaseClient<Database>;

export type WorkoutWithProgress = PlannedWorkout & {
  exercises: PlannedExercise[];
  session: WorkoutSession | null;
  actualSets: ActualSet[];
};

export type WeekWithWorkouts = ProgramWeek & {
  workouts: WorkoutWithProgress[];
};

export type PhaseWithWeeks = ProgramPhase & {
  weeks: WeekWithWorkouts[];
};

export type ProgramHierarchy = TrainingProgram & {
  phases: PhaseWithWeeks[];
};

export type WorkoutHistoryItem = {
  session: WorkoutSession;
  workout: PlannedWorkout;
  exercises: Array<{
    exercise: PlannedExercise;
    actualSets: ActualSet[];
  }>;
};

function throwQueryError(message: string): never {
  throw new Error(message);
}

export async function getActiveProgramHierarchy(
  supabase: TrainingClient,
  userId: string,
): Promise<ProgramHierarchy | null> {
  const { data: program, error: programError } = await supabase
    .from("training_programs")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (programError) {
    throwQueryError("Не удалось загрузить тренировочную программу.");
  }

  if (!program) {
    return null;
  }

  const { data: phases, error: phasesError } = await supabase
    .from("program_phases")
    .select("*")
    .eq("user_id", userId)
    .eq("program_id", program.id)
    .order("phase_number");

  if (phasesError) {
    throwQueryError("Не удалось загрузить фазы программы.");
  }

  const phaseIds = phases.map((phase) => phase.id);
  if (!phaseIds.length) {
    return { ...program, phases: [] };
  }

  const { data: weeks, error: weeksError } = await supabase
    .from("program_weeks")
    .select("*")
    .eq("user_id", userId)
    .in("phase_id", phaseIds)
    .order("start_date");

  if (weeksError) {
    throwQueryError("Не удалось загрузить недели программы.");
  }

  const weekIds = weeks.map((week) => week.id);
  const workouts = weekIds.length
    ? await supabase
        .from("planned_workouts")
        .select("*")
        .eq("user_id", userId)
        .in("week_id", weekIds)
        .order("scheduled_date")
        .order("workout_order")
    : { data: [], error: null };

  if (workouts.error) {
    throwQueryError("Не удалось загрузить тренировки программы.");
  }

  const workoutRows = workouts.data ?? [];
  const workoutIds = workoutRows.map((workout) => workout.id);
  const [exercises, sessions] = workoutIds.length
    ? await Promise.all([
        supabase
          .from("planned_exercises")
          .select("*")
          .eq("user_id", userId)
          .in("planned_workout_id", workoutIds)
          .order("exercise_order"),
        supabase
          .from("workout_sessions")
          .select("*")
          .eq("user_id", userId)
          .in("planned_workout_id", workoutIds),
      ])
    : [
        { data: [], error: null },
        { data: [], error: null },
      ];

  if (exercises.error || sessions.error) {
    throwQueryError("Не удалось загрузить прогресс по тренировкам.");
  }

  const sessionRows = sessions.data ?? [];
  const sessionIds = sessionRows.map((session) => session.id);
  const actualSets = sessionIds.length
    ? await supabase
        .from("actual_sets")
        .select("*")
        .eq("user_id", userId)
        .in("workout_session_id", sessionIds)
        .order("set_number")
    : { data: [], error: null };

  if (actualSets.error) {
    throwQueryError("Не удалось загрузить записанные подходы.");
  }

  return {
    ...program,
    phases: phases.map((phase) => ({
      ...phase,
      weeks: weeks
        .filter((week) => week.phase_id === phase.id)
        .map((week) => ({
          ...week,
          workouts: workoutRows
            .filter((workout) => workout.week_id === week.id)
            .map((workout) => {
              const session =
                sessionRows.find(
                  (item) => item.planned_workout_id === workout.id,
                ) ?? null;

              return {
                ...workout,
                exercises: (exercises.data ?? []).filter(
                  (exercise) =>
                    exercise.planned_workout_id === workout.id,
                ),
                session,
                actualSets: session
                  ? (actualSets.data ?? []).filter(
                      (actualSet) =>
                        actualSet.workout_session_id === session.id,
                    )
                  : [],
              };
            }),
        })),
    })),
  };
}

export function findWorkout(
  program: ProgramHierarchy,
  workoutId: string,
): WorkoutWithProgress | null {
  for (const phase of program.phases) {
    for (const week of phase.weeks) {
      const workout = week.workouts.find((item) => item.id === workoutId);
      if (workout) {
        return workout;
      }
    }
  }

  return null;
}

export async function getWorkoutHistory(
  supabase: TrainingClient,
  userId: string,
): Promise<WorkoutHistoryItem[]> {
  const { data: sessions, error: sessionsError } = await supabase
    .from("workout_sessions")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "completed")
    .order("completed_at", { ascending: false });

  if (sessionsError) {
    throwQueryError("Не удалось загрузить историю тренировок.");
  }

  if (!sessions.length) {
    return [];
  }

  const workoutIds = sessions.map((session) => session.planned_workout_id);
  const sessionIds = sessions.map((session) => session.id);
  const [workouts, exercises, actualSets] = await Promise.all([
    supabase
      .from("planned_workouts")
      .select("*")
      .eq("user_id", userId)
      .in("id", workoutIds),
    supabase
      .from("planned_exercises")
      .select("*")
      .eq("user_id", userId)
      .in("planned_workout_id", workoutIds)
      .order("exercise_order"),
    supabase
      .from("actual_sets")
      .select("*")
      .eq("user_id", userId)
      .in("workout_session_id", sessionIds)
      .order("set_number"),
  ]);

  if (workouts.error || exercises.error || actualSets.error) {
    throwQueryError("Не удалось загрузить детали истории тренировок.");
  }

  return sessions.flatMap((session) => {
    const workout = workouts.data.find(
      (item) => item.id === session.planned_workout_id,
    );
    if (!workout) {
      return [];
    }

    return [
      {
        session,
        workout,
        exercises: exercises.data
          .filter(
            (exercise) => exercise.planned_workout_id === workout.id,
          )
          .map((exercise) => ({
            exercise,
            actualSets: actualSets.data.filter(
              (actualSet) =>
                actualSet.workout_session_id === session.id &&
                actualSet.planned_exercise_id === exercise.id,
            ),
          })),
      },
    ];
  });
}
