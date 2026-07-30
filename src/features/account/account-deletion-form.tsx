"use client";

import { useActionState } from "react";

import { deleteAccountAction } from "@/features/account/actions";
import {
  FieldError,
  FormMessage,
} from "@/features/shared/form-feedback";
import { initialFormState } from "@/features/shared/form-state";

export function AccountDeletionForm() {
  const [state, formAction, pending] = useActionState(
    deleteAccountAction,
    initialFormState,
  );

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div>
        <label className="field-label" htmlFor="confirmation">
          Для подтверждения введите УДАЛИТЬ
        </label>
        <input
          autoComplete="off"
          className="field-input border-rose-300 focus:border-rose-600 focus:ring-rose-600/20"
          id="confirmation"
          name="confirmation"
          pattern="УДАЛИТЬ"
          required
          title="Введите слово УДАЛИТЬ без пробелов и изменений"
        />
        <FieldError errors={state.errors?.confirmation} />
      </div>

      <FormMessage state={state} />

      <button
        className="inline-flex min-h-11 items-center justify-center rounded-xl bg-rose-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-800 focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Удаляем аккаунт…" : "Удалить аккаунт"}
      </button>
    </form>
  );
}
