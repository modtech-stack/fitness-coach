import { describe, expect, it } from "vitest";

import { getHomeActions } from "@/features/home/get-home-actions";

describe("getHomeActions", () => {
  it("offers separate registration and sign-in actions to a guest", () => {
    expect(
      getHomeActions({
        isAuthenticated: false,
        hasProfile: false,
        hasGoals: false,
        isSetupComplete: false,
      }),
    ).toEqual([
      {
        href: "/sign-up",
        label: "Создать аккаунт",
        kind: "primary",
      },
      {
        href: "/sign-in",
        label: "Войти",
        kind: "secondary",
      },
    ]);
  });

  it("offers one continuation action for incomplete setup", () => {
    expect(
      getHomeActions({
        isAuthenticated: true,
        hasProfile: true,
        hasGoals: false,
        isSetupComplete: false,
      }),
    ).toEqual([
      {
        href: "/onboarding/goal",
        label: "Продолжить настройку",
        kind: "primary",
      },
    ]);
  });

  it("offers one main-page action after setup", () => {
    expect(
      getHomeActions({
        isAuthenticated: true,
        hasProfile: true,
        hasGoals: true,
        isSetupComplete: true,
      }),
    ).toEqual([
      {
        href: "/dashboard",
        label: "Перейти на главную",
        kind: "primary",
      },
    ]);
  });
});
