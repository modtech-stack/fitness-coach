"use client";

import { useActionState, useState } from "react";

import { saveConstraintAction } from "@/features/onboarding/actions";
import {
  constraintTypeOptions,
  severityOptions,
} from "@/features/onboarding/schemas";
import {
  FieldError,
  FormMessage,
} from "@/features/shared/form-feedback";
import { initialFormState } from "@/features/shared/form-state";

export function ConstraintForm({
  nextPath,
}: {
  nextPath: string;
}) {
  const [hasNoConstraints, setHasNoConstraints] = useState(false);
  const [state, formAction, pending] = useActionState(
    saveConstraintAction,
    initialFormState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="next" value={nextPath} />

      <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <input
          checked={hasNoConstraints}
          className="mt-1 size-4 accent-teal-700"
          name="has_no_constraints"
          onChange={(event) =>
            setHasNoConstraints(event.target.checked)
          }
          type="checkbox"
        />
        <span>
          <span className="block font-semibold text-slate-900">
            У меня нет ограничений
          </span>
          <span className="mt-1 block text-sm text-slate-600">
            Этот выбор завершит onboarding без создания фиктивной записи.
          </span>
        </span>
      </label>

      <fieldset
        className="space-y-5 disabled:opacity-45"
        disabled={hasNoConstraints}
      >
        <div>
          <label className="field-label" htmlFor="type">
            Тип ограничения
          </label>
          <select
            className="field-input"
            defaultValue="schedule"
            id="type"
            name="type"
          >
            {constraintTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <FieldError errors={state.errors?.type} />
        </div>

        <div>
          <label className="field-label" htmlFor="constraint_description">
            Описание
          </label>
          <textarea
            className="field-input min-h-28 resize-y"
            id="constraint_description"
            maxLength={500}
            name="description"
            placeholder="Например: в будни на тренировку доступно не больше часа"
            required={!hasNoConstraints}
          />
          <FieldError errors={state.errors?.description} />
        </div>

        <div>
          <label className="field-label" htmlFor="severity">
            Важность
          </label>
          <select
            className="field-input"
            defaultValue="medium"
            id="severity"
            name="severity"
          >
            {severityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <FieldError errors={state.errors?.severity} />
        </div>
      </fieldset>

      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Не используйте форму для экстренной медицинской помощи.
        Приложение не ставит диагнозы и не назначает лечение.
      </div>

      <FormMessage state={state} />

      <button
        className="primary-button w-full sm:w-auto"
        disabled={pending}
        type="submit"
      >
        {pending ? "Сохраняем…" : "Завершить onboarding"}
      </button>
    </form>
  );
}
