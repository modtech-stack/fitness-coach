import { describe, expect, it, vi } from "vitest";

import { deleteCurrentAccount } from "@/features/account/delete-current-account";

describe("deleteCurrentAccount", () => {
  it("deletes the authenticated user id and then ends the session", async () => {
    const deleteUser = vi
      .fn()
      .mockResolvedValue({ error: null });
    const signOut = vi.fn().mockResolvedValue({ error: null });

    const deleted = await deleteCurrentAccount({
      userId: "current-user-id",
      deleteUser,
      signOut,
    });

    expect(deleted).toBe(true);
    expect(deleteUser).toHaveBeenCalledWith("current-user-id");
    expect(signOut).toHaveBeenCalledOnce();
    expect(deleteUser.mock.invocationCallOrder[0]).toBeLessThan(
      signOut.mock.invocationCallOrder[0],
    );
  });

  it("keeps the session when Auth deletion fails", async () => {
    const deleteUser = vi
      .fn()
      .mockResolvedValue({ error: new Error("failed") });
    const signOut = vi.fn();

    const deleted = await deleteCurrentAccount({
      userId: "current-user-id",
      deleteUser,
      signOut,
    });

    expect(deleted).toBe(false);
    expect(signOut).not.toHaveBeenCalled();
  });
});
