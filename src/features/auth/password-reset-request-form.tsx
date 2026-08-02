"use client";

import Link from "next/link";
import { useActionState } from "react";

import { requestPasswordResetAction } from "@/features/auth/recovery-actions";
import {
  FieldError,
  FormMessage,
} from "@/features/shared/form-feedback";
import { initialFormState } from "@/features/shared/form-state";

export function PasswordResetRequestForm() {
  const [state, formAction, pending] = useActionState(
    requestPasswordResetAction,
    initialFormState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label className="field-label" htmlFor="email">
          Электронная почта
        </label>
        <input
          autoComplete="email"
          className="field-input"
          id="email"
          name="email"
          placeholder="you@example.com"
          required
          type="email"
        />
        <FieldError errors={state.errors?.email} />
      </div>

      <FormMessage state={state} />

      <button
        className="primary-button w-full"
        disabled={pending}
        type="submit"
      >
        {pending
          ? "Отправляем…"
          : "Отправить ссылку"}
      </button>

      <p className="text-center text-sm">
        <Link
          className="font-semibold text-teal-700 hover:text-teal-900"
          href="/sign-in"
        >
          Вернуться ко входу
        </Link>
      </p>
    </form>
  );
}
