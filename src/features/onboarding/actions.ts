"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  constraintSchema,
  goalSchema,
  profileSchema,
} from "@/features/onboarding/schemas";
import {
  getFieldErrors,
  type FormState,
} from "@/features/shared/form-state";
import { getSafeNextPath } from "@/lib/env";
import { requireUser } from "@/lib/auth/require-user";

export async function saveProfileAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    birth_date: formData.get("birth_date"),
    sex: formData.get("sex"),
    height_cm: formData.get("height_cm"),
    weight_kg: formData.get("weight_kg"),
    training_experience: formData.get("training_experience"),
    activity_level: formData.get("activity_level"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      errors: getFieldErrors(parsed.error),
    };
  }

  const { user, supabase } = await requireUser();
  const { error } = await supabase.from("profiles").upsert(
    {
      user_id: user.id,
      ...parsed.data,
    },
    { onConflict: "user_id" },
  );

  if (error) {
    return {
      status: "error",
      message: "Не удалось сохранить профиль. Попробуйте ещё раз.",
    };
  }

  revalidatePath("/dashboard");
  redirect(
    getSafeNextPath(
      formData.get("next"),
      "/onboarding/goal",
    ),
  );
}

export async function saveGoalAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = goalSchema.safeParse({
    goal_type: formData.get("goal_type"),
    description: formData.get("description"),
    priority: formData.get("priority"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      errors: getFieldErrors(parsed.error),
    };
  }

  const { user, supabase } = await requireUser();
  const { error } = await supabase.from("goals").insert({
    user_id: user.id,
    ...parsed.data,
  });

  if (error) {
    return {
      status: "error",
      message: "Не удалось сохранить цель. Попробуйте ещё раз.",
    };
  }

  revalidatePath("/dashboard");
  redirect(
    getSafeNextPath(
      formData.get("next"),
      "/onboarding/constraints",
    ),
  );
}

export async function saveConstraintAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const hasNoConstraints =
    formData.get("has_no_constraints") === "on";
  const { user, supabase } = await requireUser();

  if (!hasNoConstraints) {
    const parsed = constraintSchema.safeParse({
      type: formData.get("type"),
      description: formData.get("description"),
      severity: formData.get("severity"),
    });

    if (!parsed.success) {
      return {
        status: "error",
        errors: getFieldErrors(parsed.error),
      };
    }

    const { error } = await supabase.from("constraints").insert({
      user_id: user.id,
      ...parsed.data,
    });

    if (error) {
      return {
        status: "error",
        message:
          "Не удалось сохранить ограничение. Попробуйте ещё раз.",
      };
    }
  }

  const { error: completionError } = await supabase
    .from("profiles")
    .update({ onboarding_completed_at: new Date().toISOString() })
    .eq("user_id", user.id);

  if (completionError) {
    return {
      status: "error",
      message:
        "Данные сохранены, но onboarding не завершён. Попробуйте ещё раз.",
    };
  }

  revalidatePath("/dashboard");
  redirect(getSafeNextPath(formData.get("next")));
}
