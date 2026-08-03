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
