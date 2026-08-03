"use client";

import { useActionState, useState } from "react";
import { usePathname } from "next/navigation";

import { FormMessage } from "@/features/shared/form-feedback";
import { initialFormState } from "@/features/shared/form-state";
import { submitProductFeedbackAction } from "@/features/training/actions";

export function FeedbackWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    submitProductFeedbackAction,
    initialFormState,
  );

  if (!open) {
    return (
      <button
        className="fixed right-4 bottom-4 z-40 rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 focus-visible:outline-none sm:right-6 sm:bottom-6"
        onClick={() => setOpen(true)}
        type="button"
      >
        Сообщить о доработке
      </button>
    );
  }

  return (
    <div
      aria-label="Обратная связь"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-3 sm:items-center sm:p-6"
      role="dialog"
    >
      <section className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-teal-700">
              Обратная связь
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-950">
              Сообщить о доработке
            </h2>
          </div>
          <button
            aria-label="Закрыть форму"
            className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            onClick={() => setOpen(false)}
            type="button"
          >
            Закрыть
          </button>
        </div>

        {state.status === "success" ? (
          <div className="mt-6 space-y-4">
            <FormMessage state={state} />
            <button
              className="primary-button w-full justify-center sm:w-auto"
              onClick={() => setOpen(false)}
              type="button"
            >
              Готово
            </button>
          </div>
        ) : (
          <form action={formAction} className="mt-6 space-y-5">
            <input name="page_url" type="hidden" value={pathname} />
            <div>
              <label className="field-label" htmlFor="feedback-message">
                Что нужно исправить или улучшить?
              </label>
              <textarea
                autoFocus
                className="field-input min-h-36 resize-y"
                id="feedback-message"
                maxLength={2000}
                minLength={3}
                name="message"
                placeholder="Опишите проблему или предложение"
                required
              />
            </div>
            <p className="text-xs leading-5 text-slate-500">
              Вместе с сообщением сохраняются эта страница, ваш аккаунт и время
              отправки.
            </p>
            <FormMessage state={state} />
            <button
              className="primary-button w-full justify-center sm:w-auto"
              disabled={pending}
              type="submit"
            >
              {pending ? "Отправляем…" : "Отправить"}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
