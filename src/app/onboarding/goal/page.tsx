import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { GoalForm } from "@/features/onboarding/goal-form";
import { OnboardingStepper } from "@/features/onboarding/onboarding-stepper";
import { entityIdSchema } from "@/features/onboarding/schemas";
import { requireUser } from "@/lib/auth/require-user";

export const metadata: Metadata = {
  title: "Цель",
};

type GoalPageProps = {
  searchParams: Promise<{ edit?: string }>;
};

export default async function GoalPage({
  searchParams,
}: GoalPageProps) {
  const { user, supabase } = await requireUser();
  const params = await searchParams;
  const parsedEditId = params.edit
    ? entityIdSchema.safeParse(params.edit)
    : null;

  if (parsedEditId && !parsedEditId.success) {
    redirect("/dashboard");
  }

  const [{ data: profile }, { data: goal }] = await Promise.all([
    supabase
      .from("profiles")
      .select("onboarding_completed_at")
      .eq("user_id", user.id)
      .maybeSingle(),
    parsedEditId?.success
      ? supabase
          .from("goals")
          .select("*")
          .eq("id", parsedEditId.data)
          .eq("user_id", user.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  if (!profile) {
    redirect("/onboarding/profile");
  }

  if (parsedEditId?.success && !goal) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      {!profile.onboarding_completed_at ? (
        <OnboardingStepper currentStep={2} />
      ) : null}
      <section className="surface-card">
        <p className="text-sm font-semibold text-teal-700">
          {profile.onboarding_completed_at
            ? "Управление целями"
            : "Шаг 2 из 3"}
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
          {goal ? "Изменить цель" : "Новая цель"}
        </h1>
        <p className="mt-2 mb-7 text-sm leading-6 text-slate-600">
          Сформулируйте желаемый результат своими словами. Можно выбрать
          одну основную цель или добавить второстепенную; новая активная
          основная цель автоматически сделает прежнюю второстепенной.
        </p>
        <GoalForm
          goal={goal}
          nextPath={
            profile.onboarding_completed_at
              ? "/dashboard"
              : "/onboarding/constraints"
          }
        />
      </section>
    </div>
  );
}
