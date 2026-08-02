import { describe, expect, it } from "vitest";

import { hasRecoveryAuthenticationMethod } from "@/lib/auth/recovery-session";

describe("hasRecoveryAuthenticationMethod", () => {
  it("accepts a recovery-authenticated session", () => {
    expect(
      hasRecoveryAuthenticationMethod({
        amr: [
          { method: "password", timestamp: 1 },
          { method: "recovery", timestamp: 2 },
        ],
      }),
    ).toBe(true);
  });

  it.each([
    null,
    {},
    { amr: [] },
    { amr: [{ method: "password" }] },
    { amr: "recovery" },
  ])("rejects a non-recovery session: %j", (claims) => {
    expect(hasRecoveryAuthenticationMethod(claims)).toBe(false);
  });
});
