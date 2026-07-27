"use client";

import { useActionState } from "react";

import { saveGoalAction } from "@/features/onboarding/actions";
import {
  goalStatusOptions,
  goalTypeOptions,
} from "@/features/onboarding/schemas";
import {
  FieldError,
  FormMessage,
} from "@/features/shared/form-feedback";
import { initialFormState } from "@/features/shared/form-state";

export function GoalForm({ nextPath }: { nextPath: string }) {
  const [state, formAction, pending] = useActionState(
    saveGoalAction,
    initialFormState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="next" value={nextPath} />

      <div>
        <label className="field-label" htmlFor="goal_type">
          Тип цели
        </label>
        <select
          className="field-input"
          defaultValue="general_fitness"
          id="goal_type"
          name="goal_type"
        >
          {goalTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <FieldError errors={state.errors?.goal_type} />
      </div>

      <div>
        <label className="field-label" htmlFor="description">
          Что вы хотите получить?
        </label>
        <textarea
          className="field-input min-h-28 resize-y"
          id="description"
          maxLength={500}
          name="description"
          placeholder="Например: тренироваться регулярно три раза в неделю"
          required
        />
        <FieldError errors={state.errors?.description} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="priority">
            Приоритет
          </label>
          <select
            className="field-input"
            defaultValue="1"
            id="priority"
            name="priority"
          >
            <option value="1">1 — главный</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5 — дополнительный</option>
          </select>
          <FieldError errors={state.errors?.priority} />
        </div>

        <div>
          <label className="field-label" htmlFor="status">
            Статус
          </label>
          <select
            className="field-input"
            defaultValue="active"
            id="status"
            name="status"
          >
            {goalStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <FieldError errors={state.errors?.status} />
        </div>
      </div>

      <FormMessage state={state} />

      <button
        className="primary-button w-full sm:w-auto"
        disabled={pending}
        type="submit"
      >
        {pending ? "Сохраняем…" : "Сохранить цель"}
      </button>
    </form>
  );
}
