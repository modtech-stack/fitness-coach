import { z } from "zod";

import type {
  ActivityLevel,
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
    "none",
    "under_6_months",
    "six_months_to_two_years",
    "over_two_years",
  ]),
  activity_level: z.enum(["low", "moderate", "high"]),
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
    .refine(
      (value) => value === 1 || value === 2,
      "Выберите основную или второстепенную цель.",
    ),
  status: z.enum(["active", "paused", "completed"]),
});

export const constraintSchema = z.object({
  type: z.enum([
    "pain",
    "injury",
    "health",
    "schedule",
    "equipment",
    "other",
  ]),
  description: z
    .string()
    .trim()
    .min(3, "Опишите ограничение хотя бы тремя символами.")
    .max(500, "Описание не должно быть длиннее 500 символов."),
});

export const entityIdSchema = z
  .string()
  .uuid("Запись не найдена. Обновите страницу и попробуйте ещё раз.");

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
  { value: "none", label: "Нет регулярного опыта" },
  { value: "under_6_months", label: "Менее 6 месяцев" },
  {
    value: "six_months_to_two_years",
    label: "От 6 месяцев до 2 лет",
  },
  { value: "over_two_years", label: "Более 2 лет" },
];

export const activityOptions: ReadonlyArray<{
  value: ActivityLevel;
  label: string;
  description: string;
}> = [
  {
    value: "low",
    label: "Низкая",
    description:
      "В основном сидячая работа, мало ходьбы и бытовой активности. Например, офисная работа и обычно менее 5 000 шагов в день.",
  },
  {
    value: "moderate",
    label: "Умеренная",
    description:
      "В течение дня есть ходьба или работа на ногах, но без тяжёлого физического труда. Например, примерно 5 000–10 000 шагов в день.",
  },
  {
    value: "high",
    label: "Высокая",
    description:
      "Физическая работа или высокая ежедневная подвижность. Например, работа пожарным, строителем, курьером или обычно более 10 000 шагов в день.",
  },
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

export const goalPriorityOptions = [
  { value: 1, label: "Основная" },
  { value: 2, label: "Второстепенная" },
] as const;

export const constraintTypeOptions: ReadonlyArray<{
  value: ConstraintType;
  label: string;
  examples: string;
}> = [
  {
    value: "pain",
    label: "Боль или дискомфорт",
    examples:
      "Например: болит колено при приседаниях, беспокоит поясница после нагрузки или появляется боль в плече при жиме.",
  },
  {
    value: "injury",
    label: "Травма или восстановление после травмы",
    examples:
      "Например: растяжение, повреждение сустава или восстановление после операции.",
  },
  {
    value: "health",
    label: "Ограничение здоровья",
    examples:
      "Например: заболевание сердца, повышенное давление, астма или ограничение врача. Приложение не ставит диагнозов.",
  },
  {
    value: "schedule",
    label: "Ограничение по времени",
    examples:
      "Например: могу тренироваться не более 40 минут или доступны только три дня в неделю.",
  },
  {
    value: "equipment",
    label: "Оборудование",
    examples:
      "Например: тренируюсь дома, нет штанги или доступны только гантели.",
  },
  {
    value: "other",
    label: "Другое",
    examples: "Опишите своими словами всё, что не подошло к другим типам.",
  },
];
