"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  constraintSchema,
  entityIdSchema,
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
  const parsedId = formData.get("id")
    ? entityIdSchema.safeParse(formData.get("id"))
    : null;

  if (parsedId && !parsedId.success) {
    return {
      status: "error",
      message: parsedId.error.issues[0]?.message,
    };
  }

  const result = parsedId?.success
    ? await supabase
        .from("goals")
        .update(parsed.data)
        .eq("id", parsedId.data)
        .eq("user_id", user.id)
        .select("id")
        .maybeSingle()
    : await supabase
        .from("goals")
        .insert({
          user_id: user.id,
          ...parsed.data,
        })
        .select("id")
        .single();

  if (result.error || !result.data) {
    return {
      status: "error",
      message: parsedId
        ? "Не удалось изменить цель. Проверьте данные и попробуйте ещё раз."
        : "Не удалось создать цель. Проверьте данные и попробуйте ещё раз.",
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
  const parsedId = formData.get("id")
    ? entityIdSchema.safeParse(formData.get("id"))
    : null;

  if (parsedId && !parsedId.success) {
    return {
      status: "error",
      message: parsedId.error.issues[0]?.message,
    };
  }

  const { user, supabase } = await requireUser();

  if (!hasNoConstraints) {
    const parsed = constraintSchema.safeParse({
      type: formData.get("type"),
      description: formData.get("description"),
    });

    if (!parsed.success) {
      return {
        status: "error",
        errors: getFieldErrors(parsed.error),
      };
    }

    const result = parsedId?.success
      ? await supabase
          .from("constraints")
          .update(parsed.data)
          .eq("id", parsedId.data)
          .eq("user_id", user.id)
          .select("id")
          .maybeSingle()
      : await supabase
          .from("constraints")
          .insert({
            user_id: user.id,
            ...parsed.data,
            severity: null,
          })
          .select("id")
          .single();

    if (result.error || !result.data) {
      return {
        status: "error",
        message: parsedId
          ? "Не удалось изменить ограничение. Проверьте данные и попробуйте ещё раз."
          : "Не удалось создать ограничение. Проверьте данные и попробуйте ещё раз.",
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
        "Данные сохранены, но первичная настройка не завершена. Попробуйте ещё раз.",
    };
  }

  revalidatePath("/dashboard");
  redirect(getSafeNextPath(formData.get("next")));
}

export async function deleteGoalAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsedId = entityIdSchema.safeParse(formData.get("id"));

  if (!parsedId.success) {
    return {
      status: "error",
      message: parsedId.error.issues[0]?.message,
    };
  }

  const { user, supabase } = await requireUser();
  const { data, error } = await supabase
    .from("goals")
    .delete()
    .eq("id", parsedId.data)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return {
      status: "error",
      message:
        "Не удалось удалить цель. Обновите страницу и попробуйте ещё раз.",
    };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function deleteConstraintAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsedId = entityIdSchema.safeParse(formData.get("id"));

  if (!parsedId.success) {
    return {
      status: "error",
      message: parsedId.error.issues[0]?.message,
    };
  }

  const { user, supabase } = await requireUser();
  const { data, error } = await supabase
    .from("constraints")
    .delete()
    .eq("id", parsedId.data)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return {
      status: "error",
      message:
        "Не удалось удалить ограничение. Обновите страницу и попробуйте ещё раз.",
    };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
