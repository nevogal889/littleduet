// Web build: Google sign-in is not offered (the app ships on iOS and Android).
export function googleRedirectUrl(): string {
  return typeof window !== 'undefined' ? `${window.location.origin}/account` : '';
}

export async function googleAuthCode(_url: string, _redirectTo: string): Promise<string | null> {
  return null;
}
