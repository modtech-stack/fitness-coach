"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getFieldErrors, type FormState } from "@/features/shared/form-state";
import {
  parsePlannedWorkoutEditFormData,
  parseProductFeedbackFormData,
  parseProgramEditFormData,
  parseWorkoutCompletionFormData,
} from "@/features/training/schemas";
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

export async function updateTrainingProgramAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = parseProgramEditFormData(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message:
        parsed.error.issues[0]?.message ??
        "Проверьте параметры программы и попробуйте ещё раз.",
      errors: getFieldErrors(parsed.error),
    };
  }

  const { supabase } = await requireUser();
  const { error } = await supabase.rpc("update_training_program", {
    p_program_id: parsed.data.program_id,
    p_name: parsed.data.name,
    p_start_date: parsed.data.start_date,
    p_week_count: parsed.data.week_count,
  });

  if (error) {
    const message = error.message.toLowerCase();
    return {
      status: "error",
      message: message.includes("completed workout dates")
        ? "Нельзя переносить даты программы после завершения тренировки."
        : message.includes("weeks with completed")
          ? "Нельзя удалить неделю с выполненной тренировкой."
          : "Не удалось изменить программу. Обновите страницу и попробуйте ещё раз.",
    };
  }

  revalidateTrainingPaths();
  redirect("/program?updated=1");
}

export async function updatePlannedWorkoutAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = parsePlannedWorkoutEditFormData(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message:
        parsed.error.issues[0]?.message ??
        "Проверьте параметры тренировки и попробуйте ещё раз.",
      errors: getFieldErrors(parsed.error),
    };
  }

  const { supabase } = await requireUser();
  const { error } = await supabase.rpc("update_planned_workout", {
    p_planned_workout_id: parsed.data.workout_id,
    p_instructions: parsed.data.instructions,
    p_exercises: parsed.data.exercises,
  });

  if (error) {
    const isCompleted = error.message
      .toLowerCase()
      .includes("completed workout");
    return {
      status: "error",
      message: isCompleted
        ? "Выполненную тренировку изменять нельзя. История сохранена без изменений."
        : "Не удалось изменить тренировку. Обновите страницу и попробуйте ещё раз.",
    };
  }

  revalidateTrainingPaths();
  revalidatePath(`/workouts/${parsed.data.workout_id}`);
  redirect(`/workouts/${parsed.data.workout_id}?updated=1`);
}

export async function submitProductFeedbackAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = parseProductFeedbackFormData(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message:
        parsed.error.issues[0]?.message ??
        "Проверьте сообщение и попробуйте ещё раз.",
      errors: getFieldErrors(parsed.error),
    };
  }

  const { supabase } = await requireUser();
  const { error } = await supabase.rpc("submit_product_feedback", {
    p_page_url: parsed.data.page_url,
    p_message: parsed.data.message,
  });

  if (error) {
    return {
      status: "error",
      message: "Не удалось отправить сообщение. Попробуйте ещё раз.",
    };
  }

  return {
    status: "success",
    message: "Спасибо! Сообщение сохранено.",
  };
}
