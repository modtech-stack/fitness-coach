import { afterEach, describe, expect, it, vi } from "vitest";

import { getSafeNextPath, getSiteUrl } from "@/lib/env";

afterEach(() => {
  vi.unstubAllEnvs();
});

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

describe("getSiteUrl", () => {
  it("uses the exact configured production origin", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fitness.example/");

    expect(getSiteUrl()).toBe("https://fitness.example");
  });

  it("uses the current Vercel deployment origin for previews", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("VERCEL_URL", "fitness-preview.vercel.app");

    expect(getSiteUrl()).toBe(
      "https://fitness-preview.vercel.app",
    );
  });
});
