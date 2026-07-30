type DeleteUserResult = {
  error: unknown | null;
};

type DeleteCurrentAccountDependencies = {
  deleteUser: (userId: string) => Promise<DeleteUserResult>;
  signOut: () => Promise<unknown>;
  userId: string;
};

export async function deleteCurrentAccount({
  deleteUser,
  signOut,
  userId,
}: DeleteCurrentAccountDependencies): Promise<boolean> {
  const { error } = await deleteUser(userId);

  if (error) {
    return false;
  }

  await signOut();
  return true;
}
