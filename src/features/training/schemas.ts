import { z } from "zod";

function requiredNumber(
  label: string,
  minimum: number,
  maximum: number,
  integer = false,
) {
  let numberSchema = z
    .number()
    .min(minimum, `${label}: минимальное значение — ${minimum}.`)
    .max(maximum, `${label}: максимальное значение — ${maximum}.`);

  if (integer) {
    numberSchema = numberSchema.int(`${label} должно быть целым числом.`);
  }

  return z
    .string()
    .trim()
    .min(1, `Укажите ${label.toLowerCase()}.`)
    .refine((value) => Number.isFinite(Number(value)), `${label} указано неверно.`)
    .transform(Number)
    .pipe(numberSchema);
}

const optionalWeightSchema = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || Number.isFinite(Number(value)),
    "Вес указан неверно.",
  )
  .transform((value) => (value === "" ? null : Number(value)))
  .pipe(
    z
      .number()
      .min(0, "Вес не может быть отрицательным.")
      .max(1000, "Вес не должен превышать 1000 кг.")
      .nullable(),
  );

const optionalRpeSchema = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || Number.isFinite(Number(value)),
    "Целевой RPE указан неверно.",
  )
  .transform((value) => (value === "" ? null : Number(value)))
  .pipe(
    z
      .number()
      .min(1, "Целевой RPE не может быть меньше 1.")
      .max(10, "Целевой RPE не может быть больше 10.")
      .nullable(),
  );

const internalPageUrlSchema = z
  .string()
  .trim()
  .min(1)
  .max(500)
  .refine(
    (value) =>
      value.startsWith("/") &&
      !value.startsWith("//") &&
      !value.includes("://") &&
      !/[\u0000-\u001f\u007f]/.test(value),
    "Адрес страницы указан неверно.",
  );

const calendarDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Укажите дату начала программы.")
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }, "Дата начала программы указана неверно.");

export const actualSetSchema = z.object({
  planned_exercise_id: z
    .string()
    .uuid("Упражнение не найдено. Обновите страницу."),
  set_number: requiredNumber("Номер подхода", 1, 20, true),
  reps: requiredNumber("Количество повторений", 1, 1000, true),
  weight_kg: optionalWeightSchema,
  rpe: requiredNumber("RPE", 1, 10),
});

export const workoutCompletionSchema = z.object({
  workout_id: z
    .string()
    .uuid("Тренировка не найдена. Обновите страницу."),
  comment: z
    .string()
    .trim()
    .max(1000, "Комментарий не должен быть длиннее 1000 символов."),
  sets: z
    .array(actualSetSchema)
    .min(1, "Запишите хотя бы один выполненный подход.")
    .max(100, "За одну тренировку можно записать не более 100 подходов."),
});

export const programEditSchema = z.object({
  program_id: z.string().uuid("Программа не найдена. Обновите страницу."),
  name: z
    .string()
    .trim()
    .min(3, "Название программы должно содержать минимум 3 символа.")
    .max(120, "Название программы не должно быть длиннее 120 символов."),
  start_date: calendarDateSchema,
  week_count: requiredNumber("Количество недель", 1, 52, true),
});

export const plannedExerciseEditSchema = z.object({
  id: z.string().uuid("Упражнение не найдено. Обновите страницу."),
  name: z
    .string()
    .trim()
    .min(2, "Название упражнения должно содержать минимум 2 символа.")
    .max(120, "Название упражнения не должно быть длиннее 120 символов."),
  planned_sets: requiredNumber("Количество подходов", 1, 20, true),
  planned_reps: z
    .string()
    .trim()
    .min(1, "Укажите количество повторений.")
    .max(40, "Описание повторений не должно быть длиннее 40 символов."),
  target_weight_kg: optionalWeightSchema,
  target_rpe: optionalRpeSchema,
  notes: z
    .string()
    .trim()
    .max(500, "Комментарий к упражнению не должен быть длиннее 500 символов."),
});

export const plannedWorkoutEditSchema = z.object({
  workout_id: z.string().uuid("Тренировка не найдена. Обновите страницу."),
  instructions: z
    .string()
    .trim()
    .min(3, "Комментарий к тренировке должен содержать минимум 3 символа.")
    .max(1000, "Комментарий к тренировке не должен быть длиннее 1000 символов."),
  exercises: z
    .array(plannedExerciseEditSchema)
    .min(1, "В тренировке должно быть хотя бы одно упражнение.")
    .max(50, "В тренировке не должно быть больше 50 упражнений."),
});

export const productFeedbackSchema = z.object({
  page_url: internalPageUrlSchema,
  message: z
    .string()
    .trim()
    .min(3, "Опишите, что нужно исправить или улучшить.")
    .max(2000, "Сообщение не должно быть длиннее 2000 символов."),
});

export function parseWorkoutCompletionFormData(formData: FormData) {
  const exerciseIds = formData.getAll("planned_exercise_id");
  const setNumbers = formData.getAll("set_number");
  const repetitions = formData.getAll("reps");
  const weights = formData.getAll("weight_kg");
  const rpeValues = formData.getAll("rpe");
  const fieldCounts = [
    setNumbers.length,
    repetitions.length,
    weights.length,
    rpeValues.length,
  ];
  const hasAlignedFields = fieldCounts.every(
    (fieldCount) => fieldCount === exerciseIds.length,
  );

  const sets = hasAlignedFields
    ? exerciseIds
        .map((exerciseId, index) => ({
          planned_exercise_id: exerciseId,
          set_number: setNumbers[index],
          reps: repetitions[index],
          weight_kg: weights[index],
          rpe: rpeValues[index],
        }))
        .filter((set) => {
          const values = [set.reps, set.weight_kg, set.rpe];
          return values.some(
            (value) =>
              typeof value !== "string" || value.trim().length > 0,
          );
        })
    : [];

  return workoutCompletionSchema.safeParse({
    workout_id: formData.get("workout_id"),
    comment: formData.get("comment") ?? "",
    sets,
  });
}

export function parseProgramEditFormData(formData: FormData) {
  return programEditSchema.safeParse({
    program_id: formData.get("program_id"),
    name: formData.get("name"),
    start_date: formData.get("start_date"),
    week_count: formData.get("week_count"),
  });
}

export function parsePlannedWorkoutEditFormData(formData: FormData) {
  const ids = formData.getAll("exercise_id");
  const names = formData.getAll("exercise_name");
  const sets = formData.getAll("planned_sets");
  const reps = formData.getAll("planned_reps");
  const weights = formData.getAll("target_weight_kg");
  const rpe = formData.getAll("target_rpe");
  const notes = formData.getAll("exercise_notes");
  const counts = [
    names.length,
    sets.length,
    reps.length,
    weights.length,
    rpe.length,
    notes.length,
  ];

  const exercises = counts.every((count) => count === ids.length)
    ? ids.map((id, index) => ({
        id,
        name: names[index],
        planned_sets: sets[index],
        planned_reps: reps[index],
        target_weight_kg: weights[index],
        target_rpe: rpe[index],
        notes: notes[index],
      }))
    : [];

  return plannedWorkoutEditSchema.safeParse({
    workout_id: formData.get("workout_id"),
    instructions: formData.get("instructions"),
    exercises,
  });
}

export function parseProductFeedbackFormData(formData: FormData) {
  return productFeedbackSchema.safeParse({
    page_url: formData.get("page_url"),
    message: formData.get("message"),
  });
}
