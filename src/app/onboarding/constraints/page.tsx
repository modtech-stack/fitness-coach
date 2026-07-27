import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ConstraintForm } from "@/features/onboarding/constraint-form";
import { OnboardingStepper } from "@/features/onboarding/onboarding-stepper";
import { requireUser } from "@/lib/auth/require-user";

export const metadata: Metadata = {
  title: "Ограничения",
};

export default async function ConstraintsPage() {
  const { user, supabase } = await requireUser();
  const [{ data: profile }, { count: goalsCount }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("goals")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
    ]);

  if (!profile) {
    redirect("/onboarding/profile");
  }

  if (!goalsCount) {
    redirect("/onboarding/goal");
  }

  return (
    <div className="space-y-6">
      <OnboardingStepper currentStep={3} />
      <section className="surface-card">
        <p className="text-sm font-semibold text-teal-700">
          Шаг 3 из 3
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
          Ограничения
        </h1>
        <p className="mt-2 mb-7 text-sm leading-6 text-slate-600">
          Сохраните одно важное ограничение или явно укажите, что их
          нет. Данные доступны только вашему аккаунту.
        </p>
        <ConstraintForm nextPath="/dashboard" />
      </section>
    </div>
  );
}
