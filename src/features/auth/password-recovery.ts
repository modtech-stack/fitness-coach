export const PASSWORD_RESET_REQUEST_MESSAGE =
  "Если аккаунт с таким адресом существует, мы отправили письмо для восстановления пароля.";

type PasswordResetSender = (
  email: string,
  redirectTo: string,
) => Promise<{ error: unknown | null }>;

export async function requestPasswordReset({
  email,
  redirectTo,
  send,
}: {
  email: string;
  redirectTo: string;
  send: PasswordResetSender;
}): Promise<string> {
  try {
    await send(email, redirectTo);
  } catch {
    // The same neutral response is required for existing, missing, rate-limited,
    // and temporarily unavailable accounts to prevent account enumeration.
  }

  return PASSWORD_RESET_REQUEST_MESSAGE;
}
