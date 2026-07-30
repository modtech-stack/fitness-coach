"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  signInAction,
  signUpAction,
} from "@/features/auth/actions";
import {
  FieldError,
  FormMessage,
} from "@/features/shared/form-feedback";
import { initialFormState } from "@/features/shared/form-state";

type AuthFormProps = {
  mode: "sign-in" | "sign-up";
  nextPath?: string;
};

export function AuthForm({ mode, nextPath }: AuthFormProps) {
  const action =
    mode === "sign-in" ? signInAction : signUpAction;
  const [state, formAction, pending] = useActionState(
    action,
    initialFormState,
  );
  const isSignIn = mode === "sign-in";

  return (
    <form action={formAction} className="space-y-5">
      {nextPath ? (
        <input type="hidden" name="next" value={nextPath} />
      ) : null}

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

      <div>
        <label className="field-label" htmlFor="password">
          Пароль
        </label>
        <input
          autoComplete={
            isSignIn ? "current-password" : "new-password"
          }
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

      <FormMessage state={state} />

      <button
        className="primary-button w-full"
        disabled={pending}
        type="submit"
      >
        {pending
          ? "Подождите…"
          : isSignIn
            ? "Войти"
            : "Создать аккаунт"}
      </button>

      <p className="text-center text-sm text-slate-600">
        {isSignIn ? "Ещё нет аккаунта? " : "Уже есть аккаунт? "}
        <Link
          className="font-semibold text-teal-700 hover:text-teal-900"
          href={isSignIn ? "/sign-up" : "/sign-in"}
        >
          {isSignIn ? "Зарегистрироваться" : "Войти"}
        </Link>
      </p>
    </form>
  );
}
