import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ConstraintForm } from "@/features/onboarding/constraint-form";
import { OnboardingStepper } from "@/features/onboarding/onboarding-stepper";
import { entityIdSchema } from "@/features/onboarding/schemas";
import { requireUser } from "@/lib/auth/require-user";

export const metadata: Metadata = {
  title: "Ограничения",
};

type ConstraintsPageProps = {
  searchParams: Promise<{ edit?: string }>;
};

export default async function ConstraintsPage({
  searchParams,
}: ConstraintsPageProps) {
  const { user, supabase } = await requireUser();
  const params = await searchParams;
  const parsedEditId = params.edit
    ? entityIdSchema.safeParse(params.edit)
    : null;

  if (parsedEditId && !parsedEditId.success) {
    redirect("/dashboard");
  }

  const [
    { data: profile },
    { count: goalsCount },
    { data: constraint },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, onboarding_completed_at")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("goals")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    parsedEditId?.success
      ? supabase
          .from("constraints")
          .select("*")
          .eq("id", parsedEditId.data)
          .eq("user_id", user.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  if (!profile) {
    redirect("/onboarding/profile");
  }

  if (!goalsCount) {
    redirect("/onboarding/goal");
  }

  if (parsedEditId?.success && !constraint) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      {!profile.onboarding_completed_at ? (
        <OnboardingStepper currentStep={3} />
      ) : null}
      <section className="surface-card">
        <p className="text-sm font-semibold text-teal-700">
          {profile.onboarding_completed_at
            ? "Управление ограничениями"
            : "Шаг 3 из 3"}
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
          {constraint ? "Изменить ограничение" : "Ограничения"}
        </h1>
        <p className="mt-2 mb-7 text-sm leading-6 text-slate-600">
          Укажите всё, что может повлиять на выбор упражнений, нагрузку
          или восстановление. Например: боль, травма, заболевание,
          ограничение врача, недостаток времени или отсутствие
          оборудования.
        </p>
        <ConstraintForm
          allowNoConstraints={!profile.onboarding_completed_at}
          constraint={constraint}
          nextPath="/dashboard"
        />
      </section>
    </div>
  );
}
