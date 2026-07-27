import { describe, expect, it } from "vitest";

import { getSafeNextPath } from "@/lib/env";

describe("getSafeNextPath", () => {
  it("keeps a local application path", () => {
    expect(getSafeNextPath("/onboarding/profile")).toBe(
      "/onboarding/profile",
    );
  });

  it.each([
    "https://example.com",
    "//example.com",
    "/\\example.com",
    "/dashboard\nLocation: https://example.com",
  ])("rejects an unsafe redirect target: %s", (value) => {
    expect(getSafeNextPath(value)).toBe("/dashboard");
  });
});
