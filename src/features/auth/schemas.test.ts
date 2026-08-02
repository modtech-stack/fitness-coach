import { describe, expect, it } from "vitest";

import {
  credentialsSchema,
  newPasswordSchema,
  passwordResetRequestSchema,
} from "@/features/auth/schemas";

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

describe("passwordResetRequestSchema", () => {
  it("accepts a valid email address", () => {
    expect(
      passwordResetRequestSchema.safeParse({
        email: "new-user@example.test",
      }).success,
    ).toBe(true);
  });

  it("rejects an invalid email address", () => {
    expect(
      passwordResetRequestSchema.safeParse({
        email: "not-an-email",
      }).success,
    ).toBe(false);
  });
});

describe("newPasswordSchema", () => {
  it("accepts matching strong passwords", () => {
    expect(
      newPasswordSchema.safeParse({
        password: "НовыйПароль123",
        passwordConfirmation: "НовыйПароль123",
      }).success,
    ).toBe(true);
  });

  it("rejects passwords that do not match", () => {
    expect(
      newPasswordSchema.safeParse({
        password: "НовыйПароль123",
        passwordConfirmation: "ДругойПароль123",
      }).success,
    ).toBe(false);
  });

  it("rejects a weak password", () => {
    expect(
      newPasswordSchema.safeParse({
        password: "password",
        passwordConfirmation: "password",
      }).success,
    ).toBe(false);
  });
});
