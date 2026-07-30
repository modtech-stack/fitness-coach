"use client";

import { useActionState } from "react";

import { updatePasswordAction } from "@/features/auth/recovery-actions";
import {
  FieldError,
  FormMessage,
} from "@/features/shared/form-feedback";
import { initialFormState } from "@/features/shared/form-state";

export function NewPasswordForm() {
  const [state, formAction, pending] = useActionState(
    updatePasswordAction,
    initialFormState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label className="field-label" htmlFor="password">
          Новый пароль
        </label>
        <input
          autoComplete="new-password"
          className="field-input"
          id="password"
          minLength={8}
          name="password"
          required
          type="password"
        />
        <p className="mt-1 text-xs text-slate-500">
          Минимум 8 символов, хотя бы одна буква и одна цифра.
        </p>
        <FieldError errors={state.errors?.password} />
      </div>

      <div>
        <label
          className="field-label"
          htmlFor="passwordConfirmation"
        >
          Повторите новый пароль
        </label>
        <input
          autoComplete="new-password"
          className="field-input"
          id="passwordConfirmation"
          minLength={8}
          name="passwordConfirmation"
          required
          type="password"
        />
        <FieldError
          errors={state.errors?.passwordConfirmation}
        />
      </div>

      <FormMessage state={state} />

      <button
        className="primary-button w-full"
        disabled={pending}
        type="submit"
      >
        {pending ? "Сохраняем…" : "Установить новый пароль"}
      </button>
    </form>
  );
}
