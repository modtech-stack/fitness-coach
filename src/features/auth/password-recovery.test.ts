import { describe, expect, it, vi } from "vitest";

import {
  PASSWORD_RESET_REQUEST_MESSAGE,
  requestPasswordReset,
} from "@/features/auth/password-recovery";

describe("requestPasswordReset", () => {
  it.each([
    { error: null },
    { error: new Error("user not found") },
  ])(
    "returns the same neutral message for every provider result",
    async (providerResult) => {
      const send = vi.fn().mockResolvedValue(providerResult);

      await expect(
        requestPasswordReset({
          email: "user@example.test",
          redirectTo:
            "https://fitness.example/auth/recovery",
          send,
        }),
      ).resolves.toBe(PASSWORD_RESET_REQUEST_MESSAGE);

      expect(send).toHaveBeenCalledWith(
        "user@example.test",
        "https://fitness.example/auth/recovery",
      );
    },
  );

  it("keeps the response neutral when the provider throws", async () => {
    const send = vi
      .fn()
      .mockRejectedValue(new Error("network failure"));

    await expect(
      requestPasswordReset({
        email: "user@example.test",
        redirectTo: "http://localhost:3000/auth/recovery",
        send,
      }),
    ).resolves.toBe(PASSWORD_RESET_REQUEST_MESSAGE);
  });
});
