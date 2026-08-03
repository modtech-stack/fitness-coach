"use client";

import { useActionState } from "react";

import { FormMessage } from "@/features/shared/form-feedback";
import { initialFormState } from "@/features/shared/form-state";
import { completeWorkoutAction } from "@/features/training/actions";
import type { PlannedExercise } from "@/types/database";

export function WorkoutCompletionForm({
  workoutId,
  exercises,
}: {
  workoutId: string;
  exercises: PlannedExercise[];
}) {
  const [state, formAction, pending] = useActionState(
    completeWorkoutAction,
    initialFormState,
  );

  return (
    <form action={formAction} className="mt-8 space-y-8">
      <input name="workout_id" type="hidden" value={workoutId} />

      {exercises.map((exercise) => (
        <fieldset
          className="surface-card"
          key={exercise.id}
        >
          <legend className="px-1 text-lg font-bold text-slate-950">
            {exercise.exercise_order}. {exercise.name}
          </legend>
          <p className="mt-2 text-sm text-slate-600">
            План: {exercise.planned_sets} × {exercise.planned_reps}
            {exercise.target_rpe ? ` · RPE ${exercise.target_rpe}` : ""}
            {exercise.target_weight_kg !== null
              ? ` · ${exercise.target_weight_kg} кг`
              : ""}
          </p>
          {exercise.notes ? (
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {exercise.notes}
            </p>
          ) : null}

          <div className="mt-5 space-y-3">
            <p className="text-sm text-slate-500">
              Заполняйте только выполненные подходы. Невыполненные строки можно
              оставить пустыми.
            </p>
            {Array.from({ length: exercise.planned_sets }, (_, index) => {
              const setNumber = index + 1;
              const rowId = `${exercise.id}-${setNumber}`;

              return (
                <div
                  className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[auto_1fr_1fr_1fr] sm:items-end"
                  key={rowId}
                >
                  <p className="pb-2 text-sm font-bold text-slate-700">
                    Подход {setNumber}
                  </p>
                  <input
                    name="planned_exercise_id"
                    type="hidden"
                    value={exercise.id}
                  />
                  <input
                    name="set_number"
                    type="hidden"
                    value={setNumber}
                  />
                  <div>
                    <label className="field-label" htmlFor={`${rowId}-reps`}>
                      Повторения
                    </label>
                    <input
                      className="field-input"
                      id={`${rowId}-reps`}
                      inputMode="numeric"
                      max="1000"
                      min="1"
                      name="reps"
                      type="number"
                    />
                  </div>
                  <div>
                    <label className="field-label" htmlFor={`${rowId}-weight`}>
                      Вес, кг
                    </label>
                    <input
                      className="field-input"
                      id={`${rowId}-weight`}
                      inputMode="decimal"
                      max="1000"
                      min="0"
                      name="weight_kg"
                      placeholder={
                        exercise.target_weight_kg !== null
                          ? String(exercise.target_weight_kg)
                          : "Без веса"
                      }
                      step="0.25"
                      type="number"
                    />
                  </div>
                  <div>
                    <label className="field-label" htmlFor={`${rowId}-rpe`}>
                      RPE
                    </label>
                    <input
                      className="field-input"
                      id={`${rowId}-rpe`}
                      inputMode="decimal"
                      max="10"
                      min="1"
                      name="rpe"
                      placeholder={
                        exercise.target_rpe !== null
                          ? String(exercise.target_rpe)
                          : "1–10"
                      }
                      step="0.5"
                      type="number"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </fieldset>
      ))}

      <section className="surface-card">
        <label className="field-label" htmlFor="comment">
          Комментарий к тренировке
        </label>
        <textarea
          className="field-input min-h-28 resize-y"
          id="comment"
          maxLength={1000}
          name="comment"
          placeholder="Самочувствие, техника, что получилось или вызвало трудности"
        />
      </section>

      <FormMessage state={state} />

      <button
        className="primary-button w-full justify-center sm:w-auto"
        disabled={pending}
        type="submit"
      >
        {pending ? "Сохраняем…" : "Завершить и сохранить тренировку"}
      </button>
    </form>
  );
}
