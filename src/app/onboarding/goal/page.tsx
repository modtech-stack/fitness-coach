import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { GoalForm } from "@/features/onboarding/goal-form";
import { OnboardingStepper } from "@/features/onboarding/onboarding-stepper";
import { requireUser } from "@/lib/auth/require-user";

export const metadata: Metadata = {
  title: "Цель",
};

export default async function GoalPage() {
  const { user, supabase } = await requireUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) {
    redirect("/onboarding/profile");
  }

  return (
    <div className="space-y-6">
      <OnboardingStepper currentStep={2} />
      <section className="surface-card">
        <p className="text-sm font-semibold text-teal-700">
          Шаг 2 из 3
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
          Главная цель
        </h1>
        <p className="mt-2 mb-7 text-sm leading-6 text-slate-600">
          Сформулируйте результат понятным языком. Приоритет 1 означает
          основную цель.
        </p>
        <GoalForm
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
