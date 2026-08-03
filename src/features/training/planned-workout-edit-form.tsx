"use client";

import { useActionState } from "react";

import { FormMessage } from "@/features/shared/form-feedback";
import { initialFormState } from "@/features/shared/form-state";
import { updatePlannedWorkoutAction } from "@/features/training/actions";
import type { PlannedExercise } from "@/types/database";

export function PlannedWorkoutEditForm({
  workoutId,
  instructions,
  exercises,
}: {
  workoutId: string;
  instructions: string;
  exercises: PlannedExercise[];
}) {
  const [state, formAction, pending] = useActionState(
    updatePlannedWorkoutAction,
    initialFormState,
  );

  return (
    <form action={formAction} className="mt-8 space-y-6">
      <input name="workout_id" type="hidden" value={workoutId} />

      <section className="surface-card">
        <label className="field-label" htmlFor="workout-instructions">
          Комментарий к тренировке
        </label>
        <textarea
          className="field-input min-h-28 resize-y"
          defaultValue={instructions}
          id="workout-instructions"
          maxLength={1000}
          minLength={3}
          name="instructions"
          required
        />
      </section>

      {exercises.map((exercise) => (
        <fieldset className="surface-card min-w-0" key={exercise.id}>
          <legend className="max-w-full px-1 text-lg font-bold break-words text-slate-950 [overflow-wrap:anywhere]">
            Упражнение {exercise.exercise_order}
          </legend>
          <input name="exercise_id" type="hidden" value={exercise.id} />

          <div className="mt-3">
            <label className="field-label" htmlFor={`${exercise.id}-name`}>
              Название упражнения
            </label>
            <input
              className="field-input"
              defaultValue={exercise.name}
              id={`${exercise.id}-name`}
              maxLength={120}
              minLength={2}
              name="exercise_name"
              required
            />
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="field-label" htmlFor={`${exercise.id}-sets`}>
                Подходы
              </label>
              <input
                className="field-input"
                defaultValue={exercise.planned_sets}
                id={`${exercise.id}-sets`}
                inputMode="numeric"
                max={20}
                min={1}
                name="planned_sets"
                required
                type="number"
              />
            </div>
            <div>
              <label className="field-label" htmlFor={`${exercise.id}-reps`}>
                Повторения
              </label>
              <input
                className="field-input"
                defaultValue={exercise.planned_reps}
                id={`${exercise.id}-reps`}
                maxLength={40}
                name="planned_reps"
                required
              />
            </div>
            <div>
              <label className="field-label" htmlFor={`${exercise.id}-weight`}>
                Рабочий вес, кг
              </label>
              <input
                className="field-input"
                defaultValue={exercise.target_weight_kg ?? ""}
                id={`${exercise.id}-weight`}
                inputMode="decimal"
                max={1000}
                min={0}
                name="target_weight_kg"
                placeholder="Не указан"
                step="0.25"
                type="number"
              />
            </div>
            <div>
              <label className="field-label" htmlFor={`${exercise.id}-rpe`}>
                Целевой RPE
              </label>
              <input
                className="field-input"
                defaultValue={exercise.target_rpe ?? ""}
                id={`${exercise.id}-rpe`}
                inputMode="decimal"
                max={10}
                min={1}
                name="target_rpe"
                placeholder="1–10"
                step="0.5"
                type="number"
              />
            </div>
          </div>

          <div className="mt-5">
            <label className="field-label" htmlFor={`${exercise.id}-notes`}>
              Комментарий к упражнению
            </label>
            <textarea
              className="field-input min-h-20 resize-y"
              defaultValue={exercise.notes ?? ""}
              id={`${exercise.id}-notes`}
              maxLength={500}
              name="exercise_notes"
            />
          </div>
        </fieldset>
      ))}

      <FormMessage state={state} />

      <button
        className="primary-button w-full justify-center sm:w-auto"
        disabled={pending}
        type="submit"
      >
        {pending ? "Сохраняем…" : "Сохранить тренировку"}
      </button>
    </form>
  );
}
