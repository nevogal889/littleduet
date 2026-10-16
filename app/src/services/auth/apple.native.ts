import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';

export async function appleSignInAvailable(): Promise<boolean> {
  if (Platform.OS !== 'ios') return false;
  try {
    return await AppleAuthentication.isAvailableAsync();
  } catch {
    return false;
  }
}

/** Returns Apple's identity token for Supabase signInWithIdToken, or null when cancelled. */
export async function appleIdentityToken(): Promise<string | null> {
  try {
    const cred = await AppleAuthentication.signInAsync({
      requestedScopes: [AppleAuthentication.AppleAuthenticationScope.EMAIL],
    });
    return cred.identityToken ?? null;
  } catch {
    return null;
  }
}
