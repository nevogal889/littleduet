import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export function googleRedirectUrl(): string {
  return Linking.createURL('auth/callback');
}

/** Opens Google's sign-in page in an in-app browser session; returns the PKCE code, or null when cancelled. */
export async function googleAuthCode(url: string, redirectTo: string): Promise<string | null> {
  try {
    const r = await WebBrowser.openAuthSessionAsync(url, redirectTo);
    if (r.type !== 'success' || !r.url) return null;
    const { queryParams } = Linking.parse(r.url);
    const code = queryParams?.code;
    return typeof code === 'string' ? code : null;
  } catch {
    return null;
  }
}
