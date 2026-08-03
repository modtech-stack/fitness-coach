import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  goalPriorityOptions,
} from "@/features/onboarding/schemas";

const projectRoot = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(path.join(projectRoot, relativePath), "utf8");
}

describe("user interface contract", () => {
  it("exposes only primary and secondary goal priorities", () => {
    expect(goalPriorityOptions).toEqual([
      { value: 1, label: "Основная" },
      { value: 2, label: "Второстепенная" },
    ]);
  });

  it("does not ask the user to select constraint severity", () => {
    expect(
      readSource("src/features/onboarding/constraint-form.tsx"),
    ).not.toMatch(/severity|Важность/u);
  });

  it("does not render the technical setup term", () => {
    const userFacingSources = [
      "src/app/page.tsx",
      "src/app/dashboard/page.tsx",
      "src/app/(auth)/sign-in/page.tsx",
      "src/app/(auth)/sign-up/page.tsx",
      "src/features/onboarding/constraint-form.tsx",
      "src/features/onboarding/onboarding-stepper.tsx",
    ];

    for (const source of userFacingSources) {
      expect(readSource(source)).not.toMatch(
        />[^<{]*onboarding[^<{]*</iu,
      );
    }
  });

  it("links password recovery from the sign-in form", () => {
    const source = readSource(
      "src/features/auth/auth-form.tsx",
    );

    expect(source).toContain("Забыли пароль?");
    expect(source).toContain('href="/forgot-password"');
  });

  it("links account management from the profile card", () => {
    const source = readSource("src/app/dashboard/page.tsx");

    expect(source).toContain("Управление аккаунтом");
    expect(source).toContain('href="/settings"');
  });

  it("sends a newly registered user to profile setup", () => {
    const source = readSource("src/features/auth/actions.ts");

    expect(source).toContain(
      "auth/confirm?next=/onboarding/profile",
    );
    expect(source).toContain('redirect("/onboarding/profile")');
  });

  it("keeps the service-role key out of client modules", () => {
    const clientModules = [
      "src/features/auth/auth-form.tsx",
      "src/features/auth/new-password-form.tsx",
      "src/features/auth/password-reset-request-form.tsx",
      "src/features/account/account-deletion-form.tsx",
      "src/features/shared/feedback-widget.tsx",
      "src/features/training/program-edit-form.tsx",
      "src/features/training/planned-workout-edit-form.tsx",
      "src/features/training/workout-completion-form.tsx",
    ];

    for (const source of clientModules) {
      expect(readSource(source)).not.toContain(
        "SUPABASE_SERVICE_ROLE_KEY",
      );
    }
  });
});
