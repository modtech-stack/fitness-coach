"use client";

import { useActionState } from "react";

import { FormMessage } from "@/features/shared/form-feedback";
import {
  initialFormState,
  type FormState,
} from "@/features/shared/form-state";

type DestructiveActionFormProps = {
  action: (
    state: FormState,
    formData: FormData,
  ) => Promise<FormState>;
  confirmMessage: string;
  id: string;
  label: string;
};

export function DestructiveActionForm({
  action,
  confirmMessage,
  id,
  label,
}: DestructiveActionFormProps) {
  const [state, formAction, pending] = useActionState(
    action,
    initialFormState,
  );

  return (
    <form
      action={formAction}
      className="inline"
      onSubmit={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      <input name="id" type="hidden" value={id} />
      <button
        className="text-sm font-semibold text-rose-700 hover:text-rose-900 disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Удаляем…" : label}
      </button>
      <FormMessage state={state} />
    </form>
  );
}
