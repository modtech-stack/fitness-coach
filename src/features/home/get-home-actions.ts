export type HomeAction = {
  href: string;
  label: string;
  kind: "primary" | "secondary";
};

type HomeState = {
  isAuthenticated: boolean;
  hasProfile: boolean;
  hasGoals: boolean;
  isSetupComplete: boolean;
};

export function getHomeActions(state: HomeState): HomeAction[] {
  if (!state.isAuthenticated) {
    return [
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
    ];
  }

  if (state.isSetupComplete) {
    return [
      {
        href: "/dashboard",
        label: "Перейти на главную",
        kind: "primary",
      },
    ];
  }

  const href = !state.hasProfile
    ? "/onboarding/profile"
    : !state.hasGoals
      ? "/onboarding/goal"
      : "/onboarding/constraints";

  return [
    {
      href,
      label: "Продолжить настройку",
      kind: "primary",
    },
  ];
}
