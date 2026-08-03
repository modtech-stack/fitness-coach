import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(path.join(projectRoot, relativePath), "utf8");
}

describe("training workflow interface", () => {
  it("links the complete manual cycle from the authenticated navigation", () => {
    const source = readSource("src/features/shared/app-navigation.tsx");

    expect(source).toContain('href: "/today"');
    expect(source).toContain('href: "/program"');
    expect(source).toContain('href: "/history"');
    expect(source).toContain('pathname.startsWith("/workouts/")');
    expect(source).toContain('href === "/today"');
    expect(source).toContain('href === "/program"');
  });

  it("redirects an authenticated visitor from the landing page", () => {
    const source = readSource("src/app/page.tsx");

    expect(source).toContain('redirect("/dashboard")');
  });

  it("shows a concrete next step on the dashboard", () => {
    const source = readSource("src/app/dashboard/page.tsx");

    expect(source).toContain("Следующий шаг");
    expect(source).toContain("Создать программу");
    expect(source).toContain("Начать тренировку");
  });

  it("records repetitions, weight, RPE, and a workout comment", () => {
    const source = readSource(
      "src/features/training/workout-completion-form.tsx",
    );

    expect(source).toContain('name="reps"');
    expect(source).toContain('name="weight_kg"');
    expect(source).toContain('name="rpe"');
    expect(source).toContain('name="comment"');
    expect(source).not.toContain(
      "defaultValue={exercise.target_rpe",
    );
  });

  it("completes the workout through one atomic database operation", () => {
    const source = readSource("src/features/training/actions.ts");

    expect(source).toContain('rpc("complete_workout"');
    expect(source).not.toMatch(/\.from\("actual_sets"\)\.insert/u);
  });

  it("does not expose the service-role key in the training client form", () => {
    const source = readSource(
      "src/features/training/workout-completion-form.tsx",
    );

    expect(source).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
  });

  it("explains that only working sets should be recorded", () => {
    const source = readSource(
      "src/features/training/workout-completion-form.tsx",
    );

    expect(source).toContain("Записывайте только рабочие подходы");
    expect(source).toContain("Разминочные подходы не считаются");
  });

  it("supports plan editing without direct table writes", () => {
    const actionSource = readSource("src/features/training/actions.ts");
    const programSource = readSource("src/app/program/page.tsx");

    expect(actionSource).toContain('rpc("update_training_program"');
    expect(actionSource).toContain('rpc("update_planned_workout"');
    expect(programSource).toContain("Изменить программу");
    expect(programSource).toContain("Изменить тренировку");
  });

  it("stores feedback through the protected RPC", () => {
    const actionSource = readSource("src/features/training/actions.ts");
    const widgetSource = readSource("src/features/shared/feedback-widget.tsx");

    expect(actionSource).toContain('rpc("submit_product_feedback"');
    expect(widgetSource).toContain("Сообщить о доработке");
    expect(widgetSource).toContain('name="page_url"');
  });

  it("does not add AI or wearable SDKs to Stage 2", () => {
    const packageJson = readSource("package.json");

    expect(packageJson).not.toMatch(/"openai"|polar|garmin|fitbit/iu);
  });

  it("describes the available training cycle on the public page", () => {
    const source = readSource("src/app/page.tsx");

    expect(source).toContain("Тренировочный цикл");
    expect(source).not.toContain(
      "Генерация программ и автоматическая адаптация появятся",
    );
  });
});
