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

      <div>
        <label
          className="field-label"
          htmlFor="training_experience"
        >
          Опыт тренировок
        </label>
        <select
          className="field-input"
          defaultValue={profile?.training_experience ?? "beginner"}
          id="training_experience"
          name="training_experience"
        >
          {experienceOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <FieldError errors={state.errors?.training_experience} />
      </div>

      <div>
        <label className="field-label" htmlFor="activity_level">
          Повседневная активность
        </label>
        <select
          className="field-input"
          defaultValue={profile?.activity_level ?? "moderate"}
          id="activity_level"
          name="activity_level"
        >
          {activityOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <FieldError errors={state.errors?.activity_level} />
      </div>

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
