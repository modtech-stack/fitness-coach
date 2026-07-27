import type { Metadata } from "next";

import { OnboardingStepper } from "@/features/onboarding/onboarding-stepper";
import { ProfileForm } from "@/features/onboarding/profile-form";
import { requireUser } from "@/lib/auth/require-user";

export const metadata: Metadata = {
  title: "Профиль",
};

export default async function ProfilePage() {
  const { user, supabase } = await requireUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  const nextPath = profile?.onboarding_completed_at
    ? "/dashboard"
    : "/onboarding/goal";

  return (
    <div className="space-y-6">
      <OnboardingStepper currentStep={1} />
      <section className="surface-card">
        <p className="text-sm font-semibold text-teal-700">
          Шаг 1 из 3
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
          Основной профиль
        </h1>
        <p className="mt-2 mb-7 text-sm leading-6 text-slate-600">
          Эти данные станут базовым контекстом для следующих этапов
          продукта. Сейчас они не используются для автоматических
          рекомендаций.
        </p>
        <ProfileForm profile={profile} nextPath={nextPath} />
      </section>
    </div>
  );
}
