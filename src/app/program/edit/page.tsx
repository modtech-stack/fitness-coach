import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AppHeader } from "@/features/shared/app-header";
import { ProgramEditForm } from "@/features/training/program-edit-form";
import { getActiveProgramHierarchy } from "@/features/training/queries";
import { requireUser } from "@/lib/auth/require-user";

export const metadata: Metadata = {
  title: "Изменить программу",
};

export const dynamic = "force-dynamic";

export default async function ProgramEditPage() {
  const { user, supabase } = await requireUser();
  const program = await getActiveProgramHierarchy(supabase, user.id);

  if (!program) {
    redirect("/program");
  }

  const weekCount = program.phases.reduce(
    (total, phase) => total + phase.weeks.length,
    0,
  );

  return (
    <main className="min-h-screen bg-slate-100">
      <AppHeader />
      <div className="mx-auto max-w-2xl px-5 py-10">
        <Link
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
          href="/program"
        >
          ← Вернуться к программе
        </Link>
        <p className="mt-8 text-sm font-semibold text-teal-700">
          Параметры цикла
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Изменить программу
        </h1>
        <p className="mt-3 leading-7 text-slate-600">
          Измените название, дату начала или количество недель. Содержание
          тренировок редактируется отдельно.
        </p>

        <ProgramEditForm
          name={program.name}
          programId={program.id}
          startDate={program.start_date}
          weekCount={weekCount}
        />
      </div>
    </main>
  );
}
