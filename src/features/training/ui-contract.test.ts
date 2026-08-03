import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(path.join(projectRoot, relativePath), "utf8");
}

describe("training workflow interface", () => {
  it("links the complete manual cycle from the authenticated navigation", () => {
    const source = readSource("src/features/shared/app-header.tsx");

    expect(source).toContain('href: "/today"');
    expect(source).toContain('href: "/program"');
    expect(source).toContain('href: "/history"');
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
