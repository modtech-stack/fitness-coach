"use client";

import { useActionState } from "react";

import { FieldError, FormMessage } from "@/features/shared/form-feedback";
import { initialFormState } from "@/features/shared/form-state";
import { updateTrainingProgramAction } from "@/features/training/actions";

export function ProgramEditForm({
  programId,
  name,
  startDate,
  weekCount,
}: {
  programId: string;
  name: string;
  startDate: string;
  weekCount: number;
}) {
  const [state, formAction, pending] = useActionState(
    updateTrainingProgramAction,
    initialFormState,
  );

  return (
    <form action={formAction} className="surface-card mt-8 space-y-6">
      <input name="program_id" type="hidden" value={programId} />

      <div>
        <label className="field-label" htmlFor="program-name">
          Название программы
        </label>
        <input
          className="field-input"
          defaultValue={name}
          id="program-name"
          maxLength={120}
          minLength={3}
          name="name"
          required
        />
        <FieldError errors={state.errors?.name} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="program-start-date">
            Дата начала
          </label>
          <input
            className="field-input"
            defaultValue={startDate}
            id="program-start-date"
            name="start_date"
            required
            type="date"
          />
          <FieldError errors={state.errors?.start_date} />
        </div>
        <div>
          <label className="field-label" htmlFor="program-week-count">
            Длительность, недель
          </label>
          <input
            className="field-input"
            defaultValue={weekCount}
            id="program-week-count"
            inputMode="numeric"
            max={52}
            min={1}
            name="week_count"
            required
            type="number"
          />
          <FieldError errors={state.errors?.week_count} />
        </div>
      </div>

      <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
        Количество недель определяет дату окончания. Новые недели добавляются
        пустыми: приложение не генерирует тренировки автоматически. Недели с
        выполненными тренировками удалить нельзя.
      </p>

      <FormMessage state={state} />

      <button className="primary-button" disabled={pending} type="submit">
        {pending ? "Сохраняем…" : "Сохранить программу"}
      </button>
    </form>
  );
}
