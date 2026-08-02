import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .email("Введите корректный адрес электронной почты.");

export const passwordSchema = z
  .string()
  .min(8, "Пароль должен содержать минимум 8 символов.")
  .regex(
    /[A-Za-zА-Яа-яЁё]/,
    "Добавьте в пароль хотя бы одну букву.",
  )
  .regex(/[0-9]/, "Добавьте в пароль хотя бы одну цифру.");

export const credentialsSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const passwordResetRequestSchema = z.object({
  email: emailSchema,
});

export const newPasswordSchema = z
  .object({
    password: passwordSchema,
    passwordConfirmation: z.string(),
  })
  .refine(
    ({ password, passwordConfirmation }) =>
      password === passwordConfirmation,
    {
      message: "Пароли не совпадают.",
      path: ["passwordConfirmation"],
    },
  );
