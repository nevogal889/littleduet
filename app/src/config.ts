// Every key is optional. Direct process.env.EXPO_PUBLIC_* access so Expo inlines them.
export const config = {
  videoBaseUrl: process.env.EXPO_PUBLIC_VIDEO_BASE_URL || '',
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  revenueCatIosKey: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY || '',
  revenueCatAndroidKey: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY || '',
  revenueCatEntitlement: process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT || 'premium',
  links: {
    privacy: 'https://littleduet.app/privacy',
    terms: 'https://littleduet.app/terms',
    support: 'mailto:support@littleduet.app?subject=Little%20Duet%20help',
    manageIos: 'https://apps.apple.com/account/subscriptions',
    manageAndroid: 'https://play.google.com/store/account/subscriptions',
  },
  /** Kids Category: gate every purchase behind the parental gate (not only from locked classes). */
  gateAllPurchases: false,
};

export const authEnabled = !!(config.supabaseUrl && config.supabaseAnonKey);
