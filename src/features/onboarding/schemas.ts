import { z } from "zod";

import type {
  ActivityLevel,
  ConstraintSeverity,
  ConstraintType,
  GoalStatus,
  GoalType,
  ProfileSex,
  TrainingExperience,
} from "@/types/database";

function isValidPastDate(value: string): boolean {
  const date = new Date(`${value}T00:00:00Z`);
  const earliest = new Date("1900-01-01T00:00:00Z");
  const today = new Date();

  return (
    !Number.isNaN(date.getTime()) &&
    date >= earliest &&
    date <= today
  );
}

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Имя должно содержать минимум 2 символа.")
    .max(80, "Имя не должно быть длиннее 80 символов."),
  birth_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Укажите дату рождения.")
    .refine(isValidPastDate, "Дата рождения должна быть в прошлом."),
  sex: z.enum([
    "female",
    "male",
    "other",
    "prefer_not_to_say",
  ]),
  height_cm: z.coerce
    .number()
    .min(100, "Рост должен быть не меньше 100 см.")
    .max(250, "Рост должен быть не больше 250 см."),
  weight_kg: z.coerce
    .number()
    .min(30, "Вес должен быть не меньше 30 кг.")
    .max(400, "Вес должен быть не больше 400 кг."),
  training_experience: z.enum([
    "beginner",
    "intermediate",
    "advanced",
  ]),
  activity_level: z.enum([
    "sedentary",
    "light",
    "moderate",
    "very_active",
  ]),
});

export const goalSchema = z.object({
  goal_type: z.enum([
    "weight_loss",
    "muscle_gain",
    "recomposition",
    "endurance",
    "general_fitness",
  ]),
  description: z
    .string()
    .trim()
    .min(3, "Опишите цель хотя бы тремя символами.")
    .max(500, "Описание не должно быть длиннее 500 символов."),
  priority: z.coerce
    .number()
    .int()
    .min(1, "Приоритет должен быть от 1 до 5.")
    .max(5, "Приоритет должен быть от 1 до 5."),
  status: z.enum(["active", "paused", "completed"]),
});

export const constraintSchema = z.object({
  type: z.enum([
    "health",
    "injury",
    "schedule",
    "equipment",
    "preference",
    "other",
  ]),
  description: z
    .string()
    .trim()
    .min(3, "Опишите ограничение хотя бы тремя символами.")
    .max(500, "Описание не должно быть длиннее 500 символов."),
  severity: z.enum(["low", "medium", "high"]),
});

export const sexOptions: ReadonlyArray<{
  value: ProfileSex;
  label: string;
}> = [
  { value: "female", label: "Женский" },
  { value: "male", label: "Мужской" },
  { value: "other", label: "Другой" },
  { value: "prefer_not_to_say", label: "Предпочитаю не указывать" },
];

export const experienceOptions: ReadonlyArray<{
  value: TrainingExperience;
  label: string;
}> = [
  { value: "beginner", label: "Начальный" },
  { value: "intermediate", label: "Средний" },
  { value: "advanced", label: "Продвинутый" },
];

export const activityOptions: ReadonlyArray<{
  value: ActivityLevel;
  label: string;
}> = [
  { value: "sedentary", label: "Низкая" },
  { value: "light", label: "Лёгкая" },
  { value: "moderate", label: "Умеренная" },
  { value: "very_active", label: "Высокая" },
];

export const goalTypeOptions: ReadonlyArray<{
  value: GoalType;
  label: string;
}> = [
  { value: "weight_loss", label: "Снижение веса" },
  { value: "muscle_gain", label: "Набор мышечной массы" },
  { value: "recomposition", label: "Рекомпозиция" },
  { value: "endurance", label: "Выносливость" },
  { value: "general_fitness", label: "Общая физическая форма" },
];

export const goalStatusOptions: ReadonlyArray<{
  value: GoalStatus;
  label: string;
}> = [
  { value: "active", label: "Активна" },
  { value: "paused", label: "Приостановлена" },
  { value: "completed", label: "Завершена" },
];

export const constraintTypeOptions: ReadonlyArray<{
  value: ConstraintType;
  label: string;
}> = [
  { value: "health", label: "Самочувствие или здоровье" },
  { value: "injury", label: "Травма или движение" },
  { value: "schedule", label: "Расписание" },
  { value: "equipment", label: "Оборудование" },
  { value: "preference", label: "Предпочтение" },
  { value: "other", label: "Другое" },
];

export const severityOptions: ReadonlyArray<{
  value: ConstraintSeverity;
  label: string;
}> = [
  { value: "low", label: "Низкая" },
  { value: "medium", label: "Средняя" },
  { value: "high", label: "Высокая" },
];
