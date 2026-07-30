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
});
