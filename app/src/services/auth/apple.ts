// Web: Sign in with Apple is offered on iOS only.
export async function appleSignInAvailable(): Promise<boolean> {
  return false;
}
export async function appleIdentityToken(): Promise<string | null> {
  return null;
}
