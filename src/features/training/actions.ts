"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getFieldErrors, type FormState } from "@/features/shared/form-state";
import { parseWorkoutCompletionFormData } from "@/features/training/schemas";
import { requireUser } from "@/lib/auth/require-user";

const trainingPaths = [
  "/dashboard",
  "/program",
  "/today",
  "/history",
] as const;

function revalidateTrainingPaths() {
  for (const path of trainingPaths) {
    revalidatePath(path);
  }
}

export async function createStarterProgramAction() {
  const { supabase } = await requireUser();
  const { error } = await supabase.rpc("create_starter_program");

  if (error) {
    redirect("/program?error=create");
  }

  revalidateTrainingPaths();
  redirect("/program?created=1");
}

export async function completeWorkoutAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = parseWorkoutCompletionFormData(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message:
        parsed.error.issues[0]?.message ??
        "Проверьте записанные подходы и попробуйте ещё раз.",
      errors: getFieldErrors(parsed.error),
    };
  }

  const { supabase } = await requireUser();
  const { error } = await supabase.rpc("complete_workout", {
    p_planned_workout_id: parsed.data.workout_id,
    p_comment: parsed.data.comment || null,
    p_sets: parsed.data.sets,
  });

  if (error) {
    const isAlreadyCompleted =
      error.code === "23505" ||
      error.message.toLowerCase().includes("already completed");

    return {
      status: "error",
      message: isAlreadyCompleted
        ? "Эта тренировка уже отмечена как выполненная."
        : "Не удалось сохранить тренировку. Обновите страницу и попробуйте ещё раз.",
    };
  }

  revalidateTrainingPaths();
  revalidatePath(`/workouts/${parsed.data.workout_id}`);
  redirect("/history?completed=1");
}
