import type { FormState } from "@/features/shared/form-state";

export function FieldError({
  errors,
}: {
  errors?: string[];
}) {
  if (!errors?.length) {
    return null;
  }

  return (
    <p className="mt-1 text-sm text-rose-700" role="alert">
      {errors[0]}
    </p>
  );
}

export function FormMessage({ state }: { state: FormState }) {
  if (!state.message) {
    return null;
  }

  const styles =
    state.status === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : "border-rose-200 bg-rose-50 text-rose-800";

  return (
    <p
      className={`rounded-xl border px-4 py-3 text-sm ${styles}`}
      role={state.status === "error" ? "alert" : "status"}
    >
      {state.message}
    </p>
  );
}
