"use client";

import { useActionState, useState } from "react";

import { saveConstraintAction } from "@/features/onboarding/actions";
import {
  FieldError,
  FormMessage,
} from "@/features/shared/form-feedback";
import { initialFormState } from "@/features/shared/form-state";
import type { Constraint } from "@/types/database";

export function ConstraintForm({
  allowNoConstraints,
  constraint,
  nextPath,
}: {
  allowNoConstraints: boolean;
  constraint: Constraint | null;
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
      {constraint ? (
        <input type="hidden" name="id" value={constraint.id} />
      ) : null}
      <input
        name="type"
        type="hidden"
        value={constraint?.type ?? "other"}
      />

      {!constraint && allowNoConstraints ? (
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
              Этот выбор завершит первичную настройку без создания
              фиктивной записи.
            </span>
          </span>
        </label>
      ) : null}

      <fieldset
        className="space-y-5 disabled:opacity-45"
        disabled={hasNoConstraints}
      >
        <div>
          <label className="field-label" htmlFor="constraint_description">
            Что важно учесть?
          </label>
          <textarea
            className="field-input min-h-28 resize-y"
            id="constraint_description"
            maxLength={500}
            name="description"
            placeholder="Например: иногда болит правое колено; дома есть только гантели; в будни доступно не больше часа"
            required={!hasNoConstraints}
            defaultValue={constraint?.description ?? ""}
          />
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Добавьте одно ограничение за раз: боль или травму, доступное
            время, оборудование либо бытовые условия. После сохранения
            можно добавить следующее.
          </p>
          <FieldError errors={state.errors?.description} />
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
        {pending
          ? "Сохраняем…"
          : constraint
            ? "Сохранить изменения"
            : allowNoConstraints
              ? "Сохранить и завершить настройку"
              : "Добавить ограничение"}
      </button>
    </form>
  );
}
