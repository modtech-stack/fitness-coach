type AuthenticationMethodReference = {
  method?: unknown;
};

export function hasRecoveryAuthenticationMethod(
  claims: unknown,
): boolean {
  if (
    typeof claims !== "object" ||
    claims === null ||
    !("amr" in claims) ||
    !Array.isArray(claims.amr)
  ) {
    return false;
  }

  return claims.amr.some(
    (entry: AuthenticationMethodReference) =>
      entry &&
      typeof entry === "object" &&
      entry.method === "recovery",
  );
}
