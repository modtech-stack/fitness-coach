import { describe, expect, it } from "vitest";

import { credentialsSchema } from "@/features/auth/schemas";

describe("credentialsSchema", () => {
  it("accepts a valid email and password", () => {
    const result = credentialsSchema.safeParse({
      email: "new-user@example.test",
      password: "Password123",
    });

    expect(result.success).toBe(true);
  });

  it("rejects weak credentials", () => {
    const result = credentialsSchema.safeParse({
      email: "not-an-email",
      password: "password",
    });

    expect(result.success).toBe(false);
  });
});
