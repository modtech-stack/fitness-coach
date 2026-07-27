import { z } from "zod";

export const credentialsSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Введите корректный email."),
  password: z
    .string()
    .min(8, "Пароль должен содержать минимум 8 символов.")
    .regex(/[A-Za-zА-Яа-я]/, "Добавьте в пароль хотя бы одну букву.")
    .regex(/[0-9]/, "Добавьте в пароль хотя бы одну цифру."),
});
