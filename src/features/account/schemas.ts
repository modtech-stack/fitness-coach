import { z } from "zod";

export const accountDeletionSchema = z.object({
  confirmation: z.literal("УДАЛИТЬ", {
    error: "Введите слово УДАЛИТЬ без пробелов и изменений.",
  }),
});
