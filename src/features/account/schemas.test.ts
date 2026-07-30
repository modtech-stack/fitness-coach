import { describe, expect, it } from "vitest";

import { accountDeletionSchema } from "@/features/account/schemas";

describe("accountDeletionSchema", () => {
  it("accepts only the exact confirmation word", () => {
    expect(
      accountDeletionSchema.safeParse({
        confirmation: "УДАЛИТЬ",
      }).success,
    ).toBe(true);
  });

  it.each(["удалить", " УДАЛИТЬ", "УДАЛИТЬ ", "DELETE", ""])(
    "rejects an inexact confirmation: %s",
    (confirmation) => {
      expect(
        accountDeletionSchema.safeParse({ confirmation }).success,
      ).toBe(false);
    },
  );
});
