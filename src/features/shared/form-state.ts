import type { ZodError } from "zod";

export type FormState = {
  status: "idle" | "error" | "success";
  message?: string;
  errors?: Record<string, string[]>;
};

export const initialFormState: FormState = {
  status: "idle",
};

export function getFieldErrors(
  error: ZodError,
): Record<string, string[]> {
  const fieldErrors = error.flatten().fieldErrors;

  return Object.fromEntries(
    Object.entries(fieldErrors).filter(
      (entry): entry is [string, string[]] =>
        Array.isArray(entry[1]) && entry[1].length > 0,
    ),
  );
}
