"use client";

import { useActionState } from "react";

import { saveProfileAction } from "@/features/onboarding/actions";
import {
  activityOptions,
  experienceOptions,
  sexOptions,
} from "@/features/onboarding/schemas";
import {
  FieldError,
  FormMessage,
} from "@/features/shared/form-feedback";
import { initialFormState } from "@/features/shared/form-state";
import type { Profile } from "@/types/database";

export function ProfileForm({
  profile,
  nextPath,
}: {
  profile: Profile | null;
  nextPath: string;
}) {
  const [state, formAction, pending] = useActionState(
    saveProfileAction,
    initialFormState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="next" value={nextPath} />

      <div>
        <label className="field-label" htmlFor="name">
          Имя
        </label>
        <input
          autoComplete="name"
          className="field-input"
          defaultValue={profile?.name ?? ""}
          id="name"
          maxLength={80}
          name="name"
          required
        />
        <FieldError errors={state.errors?.name} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="birth_date">
            Дата рождения
          </label>
          <input
            className="field-input"
            defaultValue={profile?.birth_date ?? ""}
            id="birth_date"
            name="birth_date"
            required
            type="date"
          />
          <FieldError errors={state.errors?.birth_date} />
        </div>

        <div>
          <label className="field-label" htmlFor="sex">
            Пол
          </label>
          <select
            className="field-input"
            defaultValue={profile?.sex ?? "prefer_not_to_say"}
            id="sex"
            name="sex"
          >
            {sexOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <FieldError errors={state.errors?.sex} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="height_cm">
            Рост, см
          </label>
          <input
            className="field-input"
            defaultValue={profile?.height_cm ?? ""}
            id="height_cm"
            max="250"
            min="100"
            name="height_cm"
            required
            step="0.1"
            type="number"
          />
          <FieldError errors={state.errors?.height_cm} />
        </div>

        <div>
          <label className="field-label" htmlFor="weight_kg">
            Вес, кг
          </label>
          <input
            className="field-input"
            defaultValue={profile?.weight_kg ?? ""}
            id="weight_kg"
            max="400"
            min="30"
            name="weight_kg"
            required
            step="0.1"
            type="number"
          />
          <FieldError errors={state.errors?.weight_kg} />
        </div>
      </div>

      <fieldset>
        <legend className="field-label">
          Опыт регулярных тренировок
        </legend>
        <p className="mb-3 text-sm leading-6 text-slate-600">
          Укажите, как долго вы регулярно занимались силовыми или
          аэробными тренировками. Это поможет подобрать безопасный
          объём и сложность программы.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {experienceOptions.map((option) => (
            <label
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm text-slate-800 has-checked:border-teal-600 has-checked:bg-teal-50"
              key={option.value}
            >
              <input
                className="size-4 accent-teal-700"
                defaultChecked={
                  (profile?.training_experience ?? "none") ===
                  option.value
                }
                name="training_experience"
                type="radio"
                value={option.value}
              />
              <span className="font-medium">{option.label}</span>
            </label>
          ))}
        </div>
        <FieldError errors={state.errors?.training_experience} />
      </fieldset>

      <fieldset>
        <legend className="field-label">
          Повседневная активность вне тренировок
        </legend>
        <p className="mb-3 text-sm leading-6 text-slate-600">
          Учитывайте работу, ходьбу, домашние дела и другую обычную
          активность. Не включайте сюда запланированные тренировки.
        </p>
        <div className="space-y-2">
          {activityOptions.map((option) => (
            <label
              className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 has-checked:border-teal-600 has-checked:bg-teal-50"
              key={option.value}
            >
              <input
                className="mt-1 size-4 shrink-0 accent-teal-700"
                defaultChecked={
                  (profile?.activity_level ?? "moderate") ===
                  option.value
                }
                name="activity_level"
                type="radio"
                value={option.value}
              />
              <span>
                <span className="block font-semibold text-slate-900">
                  {option.label}
                </span>
                <span className="mt-1 block text-sm leading-6 text-slate-600">
                  {option.description}
                </span>
              </span>
            </label>
          ))}
        </div>
        <FieldError errors={state.errors?.activity_level} />
      </fieldset>

      <FormMessage state={state} />

      <button
        className="primary-button w-full sm:w-auto"
        disabled={pending}
        type="submit"
      >
        {pending ? "Сохраняем…" : "Сохранить профиль"}
      </button>
    </form>
  );
}
