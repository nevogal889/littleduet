# Little Duet release checklist

This is a step-by-step guide to shipping Little Duet on the Apple App Store and Google Play. It's written for someone who isn't an engineer. Steps marked **[App teammate]** need the person who builds the app. Everything else you can do yourself in a web browser.

Work through it in order. Some steps take days to come back (company number, D-U-N-S, bank checks, Google's testing period), so start sections 1 and 2 first.

Rule sources are listed at the end. Prices are rough, in US dollars, checked October 2026. Check each vendor's pricing page before you pay.

---

## 0. What it costs (rough)

| Item | Cost | Needed? |
|---|---|---|
| Apple Developer Program | $99 per year | Yes |
| Google Play Console | $25 one time | Yes |
| Expo / EAS (builds and submits the app) | Free plan works, with slower, limited builds. Starter is $19 a month for faster builds | Yes (free is fine to start) |
| RevenueCat (checks subscriptions) | Free up to $2,500 monthly tracked revenue, then about 1% of tracked revenue. Confirm on revenuecat.com/pricing | Yes |
| Supabase (accounts and sync) | Free plan for testing. About $25 a month (Pro) for production, which includes daily backups and no auto-pausing | Only if you ship accounts in v1 |
| Video storage and delivery | About 900 classes x about 45 MB = about 40 GB. **Cloudflare R2:** about $0.015 per GB a month for storage (about $0.60 a month) and $0 for delivery. **Bunny.net:** about $0.005 per GB for storage and about $0.01 per GB delivered (1 TB a month is about $10) | Yes, pick one |
| Domain plus a simple website for the policies | $10 to $20 a year. Hosting on Cloudflare Pages or GitHub Pages is free | Yes |
| Support email on your domain | $0 to $7 a month | Yes |
| D-U-N-S number (for company developer accounts) | Free | Yes, if you enroll as a company |
| Trademark search and filing | Search is free. Filing is roughly $350 per class at the USPTO, and from about EUR 850 at the EUIPO | Recommended |
| Lawyer review of the privacy policy and terms | Roughly $500 to $2,500 | Strongly recommended |
| Store commission | 15% with Apple's App Store Small Business Program (apply for it). Google takes 15% on subscriptions | Comes out of revenue |

---

## 1. Settle the company first (open legal item)

The developer name on both stores is the legal entity that enrolls, and it's shown publicly. Changing it later is slow.

1. Form the company (the operator under COPPA and the controller under GDPR). Write the name and address into `[COMPANY_LEGAL_NAME]` and `[COMPANY_ADDRESS]` in privacy-policy.md and terms.md.
2. Get a free D-U-N-S number for the company from Dun & Bradstreet. Apple needs it for organization enrollment, and Google needs it for organization accounts. It can take a week or more.
3. Open a business bank account. Both stores pay into it.
4. Get a company website and email on your own domain, for example `hello@[YOURDOMAIN]`. Use it as `[CONTACT_EMAIL]`.
5. EU distribution: both stores ask whether you are a "trader" under the EU Digital Services Act. A company selling subscriptions is a trader, and your address, phone and email will be shown on the listing. Use business contact details, not your home address.
6. If the company is set up outside the EU or UK but sells there, ask your lawyer whether you need an EU or UK representative under GDPR Article 27.

---

## 2. Create the accounts

Make each account with the company email address and turn on two-factor sign-in everywhere.

1. **Apple Developer Program.** Enroll as an Organization at developer.apple.com/programs ($99 per year). You'll need the D-U-N-S number and a website.
2. **Google Play Console.** Create an **Organization** developer account at play.google.com/console ($25). Choose Organization rather than Personal. Personal accounts created since late 2023 must run a closed test with at least 12 testers for 14 days in a row before they can publish to production. Check the current numbers in Play Console.
3. **Expo.** Create an organization at expo.dev and invite the app teammate. The free plan is enough to start.
4. **RevenueCat.** Create an account at revenuecat.com and a project called "Little Duet".
5. **Supabase (optional).** Create a project only if v1 ships accounts. Pick an EU region (such as Frankfurt) if most of your families will be in Europe, and a US region if most will be in the US. Write the region into `[DATA_REGION]` in the privacy policy.
6. **Video hosting.** Pick **one**:
   - Cloudflare R2: create a bucket called `littleduet-video`, connect a custom domain (such as `video.[YOURDOMAIN]`) and turn on caching.
   - Bunny.net: create a Storage Zone and a Pull Zone, and turn on Token Authentication so only the app can play the paid videos.
   Write the provider into `[VIDEO_CDN_PROVIDER]` in the privacy policy, and set access-log retention to 30 days or less (`[LOG_RETENTION_DAYS]`).
7. **Data processing agreements.** Accept or sign the DPA from each provider that handles personal data: Supabase, RevenueCat, the video CDN and Expo. Keep the PDFs in one folder.

---

## 3. Product changes the store rules require

Hand this list to the app teammate before the first build. Each item is a reason the app could be rejected.

| # | Requirement | What the app must do | Rule |
|---|---|---|---|
| 1 | Purchases and links behind a parental gate | The paywall, every link out of the app (privacy policy, terms, support email, "Manage subscription", any rating prompt that leaves the app), the account screens and Grown-ups settings all open only after the parental gate. A locked class goes: tap lock, gate, paywall. Use the `gate` strings: a written math question with the numbers spelled out, which a 2 to 6-year-old can't read. | Apple 1.3; Apple Kids page |
| 2 | No third-party analytics, ads or tracking | Ship no analytics, attribution, crash-reporting or ad SDKs (no Firebase Analytics, Sentry, Amplitude, Mixpanel, AppsFlyer, Meta, AdMob). Ship no App Tracking Transparency prompt. Before each build, check that `AdSupport` and `ASIdentifierManager` don't appear in the iOS binary. On Android, block the advertising ID permission (in Expo: `android.blockedPermissions: ["com.google.android.gms.permission.AD_ID"]`). Request no location permission. | Apple 1.3 and 5.1.4; Google Families policy |
| 3 | RevenueCat set up for a kids app | Use anonymous RevenueCat user IDs only. Never send the email or account ID to RevenueCat, and don't set customer attributes. Turn on no RevenueCat integrations. Leave Apple Search Ads and AdServices attribution off. Use an SDK version later than 3.13.0, which renamed classes that Kids reviewers had flagged. | Apple 1.3; RevenueCat community thread |
| 4 | Paywall price prominence | The **billed price** ("{annualPrice} per year") is the largest pricing text on the paywall. "7 days free" and "{monthlyEquivalent} a month" are smaller and come after it. Show every disclosure line in `paywall.disclosureIos` or `paywall.disclosureAndroid`, plus working Terms of Use and Privacy Policy links and a Restore purchases button. | Apple 3.1.2 (rejection wording); Google subscriptions policy |
| 5 | Dismissible offer | The paywall always has a visible "Not now" or "Keep playing free classes" control. | Google subscriptions policy |
| 6 | Delete account in the app | If v1 ships accounts, Grown-ups, Account must include Delete account, which removes the account from the server. Also publish a web page where people can request deletion (Google asks for the URL). | Apple 5.1.1(v); Google Data safety |
| 7 | Child data minimization | Keep the child's nickname on the device only. Sync only random profile IDs, age group, picture choice and progress. Keep the child's birthday on the device only (never synced). Use the microphone only for on-device note listening, never recording, and no push-notification service (reminders are local notifications). | COPPA; Apple and Google kids rules |
| 8 | No streak-loss or guilt copy | Use only the strings provided. Never show "0 stars" or "You missed a day". | Brand promise; Google bans emotionally manipulative purchase tactics aimed at children |
| 9 | Credits | Show `grownups.about.audioCredit` and `fontCredit` in About, and include the OFL font license and CC BY attribution on an "Open-source licenses" screen. The Salamander piano samples are CC BY 3.0, which requires attribution. | CC BY 3.0, SIL OFL 1.1 |
| 10 | Export compliance | The app only uses standard HTTPS. Set `ITSAppUsesNonExemptEncryption` to false in app.json, so App Store Connect doesn't ask about encryption on every build. | Apple export compliance |
| 11 | Apple privacy manifest | Include a privacy manifest (PrivacyInfo.xcprivacy) declaring the required-reason APIs the app and its libraries use. Expo supports this in app.json under `ios.privacyManifests`. | Apple privacy manifest rule |

---

## 4. Put the policies online

1. Fill every `[PLACEHOLDER]` in privacy-policy.md and terms.md, and get the lawyer review.
2. Publish them as web pages, for example `https://[YOURDOMAIN]/privacy`, `/terms`, `/support` and `/delete-account`.
3. The `/delete-account` page explains how to delete an account in the app, and gives the support email to request it.
4. Put the live URLs into store-listing.md in place of `[TERMS_URL]` and `[PRIVACY_URL]`.

---

## 5. Upload the lesson videos

1. Get the finished files from the video teammate: `video/out/<songId>/<classId>.mp4` and `<classId>.jpg`.
2. Upload them with the same folder structure (`twinkle-twinkle/twinkle-twinkle-c01.mp4`).
3. Play three videos from a phone on mobile data to check that they start quickly.
4. Give the base URL (for example `https://video.[YOURDOMAIN]/`) to the app teammate.

---

## 6. App Store Connect: create the app

1. **Agreements, Tax and Banking:** accept the Paid Applications Agreement, add the bank account, and fill in the tax forms. Subscriptions won't work until this shows "Active".
2. Apply for the **App Store Small Business Program** (15% commission).
3. **[App teammate]** registers the bundle ID (for example `com.[company].littleduet`) in Certificates, Identifiers & Profiles, with In-App Purchase turned on.
4. **My Apps, +, New App:** platform iOS, name "Little Duet: Piano for Kids", primary language English (U.S.), the bundle ID, and SKU `littleduet-ios`.
   - If Apple says the name is taken, that answers the name-collision question. Switch to an alternative from store-listing.md.
5. **App Information:**
   - Subtitle: "Play songs together, ages 2-6"
   - Category: Primary **Education**, Secondary **Music**
   - **Made for Kids: on.** Age band: **5 and under**. Apple lets you pick only one band; most of our 2 to 6 audience is 5 or under. Once you're in the Kids category, Apple expects you to keep following the Kids rules in later updates, even if you leave the category.
   - Content Rights: answer that the app contains third-party content (public-domain songs) and that you have the rights. Keep the public-domain sign-off sheet (section 17) as proof.
   - Privacy Policy URL: your `/privacy` page.
   - License Agreement: keep Apple's Standard EULA, unless your lawyer wants terms.md uploaded as a custom EULA (see the note at the top of terms.md).
6. **Pricing and Availability:** price Free (the app is free to download, with subscriptions). Availability: start with English-speaking countries (US, UK, Canada, Australia, New Zealand, Ireland) or go worldwide; the app is English only. Complete the DSA trader declaration if you include the EU.

---

## 7. App Store Connect: create the subscriptions

1. Go to Monetization, Subscriptions, and create a **subscription group**. Reference name: `Little Duet Full Access`. Group display name: `Little Duet`.
2. Add **subscription 1**:
   - Reference name: `Monthly`
   - Product ID: `littleduet_monthly` (you can't change or reuse it later)
   - Duration: 1 month
   - Price: $9.99 (USD). Let Apple set the other countries automatically.
   - Display name: `Little Duet Monthly`. Description: `Every class of every song`
   - Review screenshot: a screenshot of the paywall. Review note: "Unlocks all classes of all 100 songs."
3. Add **subscription 2**:
   - Reference name: `Annual`
   - Product ID: `littleduet_annual`
   - Duration: 1 year
   - Price: $59.99 (USD)
   - Display name: `Little Duet Annual`. Description: `Every class of every song`
4. Put both subscriptions on the **same level** in the group. They give the same content, so switching between them takes effect at the next renewal.
5. **Introductory offer** on each subscription: type **Free**, duration **1 week**, eligibility **new subscribers**, all countries, no end date.
6. **Family Sharing:** decide before you turn it on, because you can't turn it off once it's on. Turning it on matches the promise "one plan covers every child". Write the decision into terms.md section 5.
7. Subscriptions are submitted for review with the first app version. Make sure both show "Ready to Submit".

---

## 8. Google Play Console: create the app and subscriptions

1. **Create app:** name "Little Duet: Piano for Kids", default language English (United States), App, Free. Accept the declarations.
2. **Payments profile:** Setup, Payments profile. Link the company bank account and complete tax info.
3. **[App teammate]** uploads a first build (an Android App Bundle with Google Play Billing included) to **Internal testing**. Play needs a build with billing in it before you can create subscriptions.
4. **Monetize, Products, Subscriptions, Create subscription:**
   - Product ID `littleduet_monthly`, name `Little Duet Monthly`.
     - Base plan ID `monthly`: auto-renewing, billing period 1 month, price $9.99 (USD), with other countries set from it.
     - Offer ID `trial-7d`: eligibility "New customer acquisition: never had any subscription". One phase: **Free trial, 7 days**.
     - Activate the base plan and the offer.
   - Product ID `littleduet_annual`, name `Little Duet Annual`.
     - Base plan ID `annual`: auto-renewing, billing period 1 year, price $59.99 (USD).
     - Offer ID `trial-7d`, set up the same way.
     - Activate both.
5. **License testing:** Setup, License testing. Add the Gmail addresses of your testers so they can buy without being charged.

---

## 9. RevenueCat setup

1. In the Little Duet project, add an **App Store** app: bundle ID, plus an In-App Purchase key (.p8) created in App Store Connect under Users and Access, Integrations. RevenueCat's setup screen walks you through it.
2. Add a **Play Store** app: package name, plus Google service-account credentials with access in Play Console. RevenueCat's guide shows the exact permissions. New credentials can take up to a day or more to start working.
3. Turn on server notifications: paste RevenueCat's URL into App Store Connect (App Store Server Notifications, Version 2), and set up Google Real-time developer notifications as RevenueCat's guide describes.
4. **Products:** import `littleduet_monthly` and `littleduet_annual` for both stores.
5. **Entitlement:** create `full_access` and attach all four products (two stores x two plans).
6. **Offering:** create `default` with two packages, Annual (`$rc_annual`) and Monthly (`$rc_monthly`). Mark it as the current offering.
7. **Leave off:** every integration that sends data to analytics, attribution or ad companies (Amplitude, Mixpanel, AppsFlyer, Adjust, Meta and similar), customer attributes, and Apple Search Ads attribution. Alert-only integrations that go to your own team, such as Slack or email, are fine.
8. Give the app teammate the two **public** SDK keys (iOS and Android). Never put a secret key in the app.

---

## 10. Supabase setup (only if v1 ships accounts)

1. Authentication: turn on **Email** with **one-time code (OTP)**. Turn off every social login. If you add Google or another third-party login later, Apple also requires Sign in with Apple.
2. Add custom SMTP so sign-in emails come from your domain.
3. **[App teammate]** turns on Row Level Security on every table, adds a delete-account function, and makes sure no child nickname is ever stored.
4. Make a demo account for App Review: `[DEMO_EMAIL]`, with a fixed one-time code `[DEMO_CODE]` that works only for that address. Remove it after launch if you prefer.

---

## 11. Build the app [App teammate]

1. Fill app.json: name, iOS bundle ID, Android package, version `1.0.0`, build number 1, `ITSAppUsesNonExemptEncryption: false`, privacy manifest, blocked AD_ID permission, no tracking permission text.
2. Load every user-facing string from `copy/strings.en.json`.
3. `eas build --platform ios --profile production` and `eas build --platform android --profile production`.
4. `eas submit` to send the builds to App Store Connect and Play Console.
5. Before each submission, check the iOS build for `AdSupport` or `ASIdentifierManager` and the Android manifest for `AD_ID` and location permissions. All must be absent.

---

## 12. App Store Connect: age rating answers

App Information, Age Rating, Edit. Answer:

| Section | Question | Answer |
|---|---|---|
| In-App Controls | Parental Controls | **Yes**. The parental gate restricts purchases and links. |
| In-App Controls | Age Assurance | No |
| Capabilities | Unrestricted Web Access | No |
| Capabilities | User-Generated Content | No |
| Capabilities | Social Media | No |
| Capabilities | Messaging and Chat | No |
| Capabilities | Advertising | No |
| Mature Themes | Profanity or Crude Humor; Horror/Fear Themes; Alcohol, Tobacco or Drug Use | None |
| Medical or Wellness | Medical or Treatment Information; Health or Wellness Topics | None / No |
| Sexuality or Nudity | All | None |
| Violence | Cartoon or Fantasy; Realistic; Prolonged Graphic; Guns or Other Weapons | None |
| Chance-Based Activities | Gambling; Simulated Gambling; Contests; Loot Boxes | None / No |

Expected result: **4+**. If any answer comes out differently, stop and check the content. The Kids category needs a rating that fits the age band.

---

## 13. App Store Connect: App Privacy (nutrition label) answers

App Privacy, Get Started. "Do you or your third-party partners collect data from this app?" **Yes.**

| Data type | Collected? | Purpose | Linked to the user? | Used for tracking? | Why |
|---|---|---|---|---|---|
| Contact Info: Email Address | Yes (optional account) | App Functionality | Yes | No | Grown-up sign-in |
| Identifiers: User ID | Yes (optional account) | App Functionality | Yes | No | Supabase account ID |
| Purchases: Purchase History | Yes | App Functionality, Analytics | **No** | No | RevenueCat says to select both purposes. It stays unlinked because RevenueCat only gets anonymous IDs (section 3, item 3) |
| Usage Data: Product Interaction | Yes (optional account) | App Functionality | Yes | No | Synced class progress, stars and stickers |
| Everything else (Location, Health, Financial Info, Contacts, User Content, Browsing, Search, Diagnostics, Sensitive Info, Other) | **No** | | | | |

Notes:
- If the app teammate links RevenueCat to the account ID, change Purchase History to "Linked: Yes".
- If you ever add crash reporting, add Diagnostics, and first check it's allowed in the Kids category. It usually isn't, because it's a third-party SDK.
- Video and update servers see IP addresses only to deliver files, and logs are kept 30 days or less for security. Confirm with your lawyer that this doesn't need a label entry.

---

## 14. Google Play Console: App content answers

Policy, App content. Complete every card.

1. **Privacy policy:** your `/privacy` URL.
2. **App access:** "All or some functionality is restricted". Add instructions: "Grown-ups area, paywall and links are behind a parental gate: type the answer to the written math question as digits. No login is needed; accounts are optional. Optional demo account: [DEMO_EMAIL], code [DEMO_CODE]."
3. **Ads:** "No, my app does not contain ads."
4. **Content rating (IARC):** enter the company email, then choose the category **Reference, News, or Educational**. Answer **No** to violence, fear, sexuality, language, controlled substances, crude humor and gambling. Under Miscellaneous: users can interact or exchange content: **No**; shares the user's location: **No**; purchase of digital goods: **Yes**; unrestricted internet access: **No**. Expected: Everyone / PEGI 3 / USK 0.
5. **Target audience and content:** age groups **5 and under** and **6-8**. The app targets only children, so the strictest Families rules apply: no advertising ID, no location, only SDKs suitable for child-directed services. Accept the Families policy.
6. **Data safety:**
   - Does the app collect or share required user data types? **Yes**
   - Is all user data encrypted in transit? **Yes**
   - Do you provide a way for users to request deletion? **Yes**. Add the `/delete-account` URL.
   - Data types:

| Category: type | Collected | Shared | Required or optional | Purposes |
|---|---|---|---|---|
| Personal info: Email address | Yes | No | Optional | App functionality, Account management |
| Personal info: User IDs | Yes | No | Optional | App functionality, Account management |
| Financial info: Purchase history | Yes | No | Required | App functionality, Analytics (RevenueCat guidance) |
| App activity: App interactions | Yes | No | Optional | App functionality (synced progress) |
| Device or other IDs | Yes | No | Required | App functionality, Fraud prevention. This is the conservative choice for RevenueCat's anonymous app ID. RevenueCat's guide says it's only needed with ad IDs, so ask your lawyer which to pick |
| All other types (location, contacts, photos, audio, health, messages, files, calendar, web browsing, app info and performance) | No | | | |

   - "Shared" is No, because service providers (Supabase, RevenueCat, CDN) acting for you don't count as sharing.
   - Ephemeral processing: No.
   - Security practices: tick **Committed to follow the Play Families Policy**, which shows the badge.
7. **Government app:** No. **Financial features:** None. **Health:** No. **News:** No.
8. **Advertising ID declaration:** "No, my app does not use advertising ID."

---

## 15. Store listings

Use store-listing.md for every field.

**Apple:**
- Promotional text, description (with the Terms of Use and Privacy Policy links), keywords, support URL, marketing URL, copyright `2026 [COMPANY_LEGAL_NAME]`.
- Screenshots: 6 images with the caption headlines in order, at the iPhone size App Store Connect asks for (currently the 6.9-inch display). Add the 13-inch iPad size too if the app runs on iPad.
- App Review Information: contact name, phone and email. "Sign-in required": **No**. Notes: paste the review notes below.

**Google:**
- Title, short description, full description, 512x512 icon, 1024x500 feature graphic, 6 phone screenshots (the maximum is 8), and tablet screenshots if supported.
- Category: **Education**. Tags: Music, Kids, Early learning (pick from Google's list). Contact email, website, privacy policy.

### App Review notes (Apple, and Google's App access box)

```
Little Duet is a Kids Category app (age band 5 and under) for a grown-up and a young child to use together.

Parental gate: the Grown-ups button on Home [CONFIRM POSITION WITH APP TEAMMATE], the subscription screen, account sign-in, and every link that leaves the app all open behind a parental gate. It asks a written math question with the numbers spelled out, for example "What is seven plus eight?". Type the answer as digits (15).

No sign-in is needed. The app runs in guest mode. Accounts are optional and only sync progress. Optional demo account: [DEMO_EMAIL], one-time code [DEMO_CODE].

To see the subscriptions: open any song, tap Class 2 (marked as part of the full songbook), pass the gate, and the paywall appears. Products: littleduet_monthly and littleduet_annual, each with a 7-day free trial for new subscribers. Class 1 of every song is free.

Two modes: Real piano (lesson video to copy on a home piano) and Screen piano (interactive on-screen keyboard). Switch with the mode toggle on Home.

Privacy: no advertising, no third-party analytics, no tracking, no IDFA, no AdSupport framework, no camera. The microphone is used only for on-device piano note detection in Real piano mode; nothing is recorded or sent. RevenueCat is used only to validate purchases, with anonymous IDs. All songs are in the public domain; we produced all arrangements, videos and recordings.
```

---

## 16. Test before you submit

**Apple, TestFlight:**
1. Add yourself and the team as **internal testers** (no review needed, up to 100 people).
2. Create **Sandbox** accounts in App Store Connect under Users and Access, Sandbox. Sandbox time runs fast: a 1-week trial lasts minutes and renewals come quickly.
3. For a wider family beta, add **external testers**. The first external build goes through a short Beta App Review.

**Google:**
1. Run **Internal testing** with up to 100 testers, using the license testers from section 8.
2. On a personal account, run **Closed testing** with at least 12 testers for 14 days in a row before production. Organization accounts skip this.

**Test script (on one iPhone and one Android phone):**
- [ ] Fresh install opens in guest mode, and onboarding works without typing a name.
- [ ] Class 1 plays in both modes. "Continue" appears after leaving halfway, and resumes at the right spot.
- [ ] Tapping a locked class shows the gate first, then the paywall.
- [ ] Every link out of the app (privacy, terms, support, manage subscription) shows the gate first.
- [ ] On the paywall, the billed price is the biggest price text, the disclosures are visible, and Terms, Privacy and Restore work.
- [ ] Start the trial, then confirm every class opens. Cancel in sandbox, and confirm access ends at the end of the period.
- [ ] Restore purchases works on a second device with the same store account.
- [ ] "Ask to Buy" or a pending purchase shows the waiting message.
- [ ] Airplane mode shows the offline message, not a blank screen.
- [ ] Create an account, sync, sign out, sign in on a second device, then delete the account. All work.
- [ ] Erase data on this device works.
- [ ] No tracking prompt appears, and no camera or location permission is ever requested. The microphone prompt appears only in Real piano mode, with the on-device explanation.
- [ ] Every class gives at least 1 star. No screen says "0 stars", "failed" or "missed".
- [ ] No emoji anywhere. All copy matches strings.en.json.
- [ ] About shows the piano-sample and font credits.

---

## 17. Open legal items (sign off before launch)

| # | Item | Owner | Done when |
|---|---|---|---|
| 1 | **Public-domain sign-off, per song.** For each of the 100 songs, check `origin` and `publicDomainBasis` in songs.json: melody date, lyrics date, author death years, and the source edition we copied. Public domain must hold in every launch country: in the US, works published before 1931 are public domain as of 2026; the EU and UK use the author's life plus 70 years. Look closely at songs whose familiar lyrics or tune date from after 1930. For example, The Wheels on the Bus was first published in 1939. Use the original public-domain lyrics, not modern variants. | Content teammate, then an IP lawyer | A signed sheet listing every song with its sources, reviewer name and date |
| 2 | **Trademark check on "Little Duet".** Search USPTO, EUIPO and WIPO for LITTLE DUET and DUET in classes 9, 41 and 15. Watch for Duet Friends (Amanotes, a music game) and Halilit's "Duet" kids' instrument. Decide whether to file. | Founder, then a trademark lawyer | Written clearance opinion, or a switch to the fallback name |
| 3 | **Company entity** formed, D-U-N-S issued, bank and tax set up, DSA trader details ready, EU or UK representative decided. | Founder | Both developer accounts enrolled under the company |
| 4 | **Privacy policy and terms** reviewed, placeholders filled, EULA route chosen (Apple standard plus terms, or custom). | Lawyer | Published URLs |
| 5 | **COPPA written information security program and data retention policy.** The amended COPPA Rule (compliance date April 22, 2026) requires both. The retention table is in privacy-policy.md section 7. The security program needs its own short internal document. | Founder | Internal document saved |
| 6 | **DPAs** signed with Supabase, RevenueCat, the video CDN and Expo, plus the transfer mechanism for each (EU-US Data Privacy Framework or SCCs). | Founder | PDFs filed |
| 7 | **Asset licenses:** Salamander Grand Piano samples (CC BY 3.0, attribution required in the app and, ideally, in video credits). Bricolage Grotesque and DM Sans (SIL OFL 1.1, include the license). | App and video teammates | Credits screen shipped |
| 8 | **Family Sharing** decision for the subscriptions (Apple, can't be undone). | Founder | Set in App Store Connect and noted in terms.md |

---

## 18. Submit and launch

1. **Apple:** on the 1.0 version page, attach the build, add both subscriptions under "In-App Purchases and Subscriptions", and choose **Manually release this version**. Submit for review. Kids Category reviews can take longer than usual. Reply to any rejection in the Resolution Center, quoting the review notes.
2. **Google:** create a **Production** release with the same build number. Roll out to 100% for a new app. First reviews of new apps can take several days.
3. When both are approved, release both on the same day.
4. **Launch week:**
   - Check RevenueCat for the first trials, and that trial-to-paid conversions show up after day 7.
   - Read every review and reply to the critical ones within 48 hours.
   - Update the Apple promotional text whenever you like; it doesn't need a new build.
   - For updates, use Apple's phased release (7 days) and a staged rollout on Google (for example 20%, then 50%, then 100%).
5. **Every update:** if data practices change, update the privacy policy, the Apple privacy label and the Google Data safety form together, before the build goes live.

---

## Sources

Opened and used:
- Apple, Kids apps and parental gates (developer.apple.com/kids): age bands 5 and under, 6-8, 9-11; Kids apps must comply with guidelines 1.3 and 5.1.4; gates should guard purchases and links out of the app. https://developer.apple.com/kids/
- Apple, Choosing a category: Made for Kids checkbox, age band, Kids plus another primary and secondary category. https://developer.apple.com/app-store/categories/
- Apple, Age ratings reference (App Store Connect Help): questionnaire sections and the 4+, 9+, 13+, 16+, 18+ ratings. https://developer.apple.com/help/app-store-connect/reference/age-ratings
- App Store Review Guidelines 1.3 excerpts ("must not include links out of the app, purchasing opportunities, or other distractions to kids unless reserved for a designated area behind a parental gate"; "may not send personally identifiable information or device information to third parties"), version dated June 8, 2026, via ConductAtlas: https://conductatlas.com/platform/apple/apple-app-store-review-guidelines/provision/CA-P-018784/kids-category-apps-must-not-include-external-links-or-purchases/ and https://conductatlas.com/platform/apple/apple-app-store-review-guidelines/provision/CA-P-018788/kids-category-apps-prohibited-from-sending-pii-to-third-parties/
- Guideline 5.1.4 excerpt ("Apps intended primarily for kids should not include third-party analytics or third-party advertising"), GoodBarber: https://www.goodbarber.com/help/apple-rejection-r100/apple-rejection-apps-for-kids-a365/ ; 2019 change summary: https://mjtsai.com/blog/2019/06/04/updates-to-the-app-store-review-guidelines/
- Guideline 3.1.2 required subscription info in the binary and metadata (title, length, price, functional privacy policy and Terms of Use links), Apple Developer Forums: https://developer.apple.com/forums/thread/807082
- Apple rejection wording, "the billed amount is the most clear and conspicuous pricing element", RevenueCat Community: https://community.revenuecat.com/general-questions-7/guideline-3-1-2-business-payments-subscriptions-6793
- RevenueCat in Kids Category apps (AdSupport string match fixed in SDK 3.13.0): https://community.revenuecat.com/sdks-51/we-rejected-depends-on-adsupport-guideline-1-3-safety-kids-category-729
- RevenueCat, Apple App Privacy guidance: https://www.revenuecat.com/docs/platform-resources/apple-platform-resources/apple-app-privacy.md
- RevenueCat, Google Play Data safety guidance: https://www.revenuecat.com/docs/platform-resources/google-platform-resources/google-plays-data-safety.md
- Google Play Families policies (no AAID or location for child-only apps, approved SDKs only, COPPA and GDPR compliance, Data safety accuracy): https://support.google.com/googleplay/android-developer/answer/9893335?hl=en
- Google Play content rating and target audience requirements: https://support.google.com/googleplay/android-developer/answer/9859655?hl=en
- Google Families Self-Certified Ads SDK programme: https://support.google.com/googleplay/android-developer/answer/9900633?hl=en-GB
- Designed for Families merged into the Families policy; Teacher Approved and the Kids tab: https://android-developers.googleblog.com/2022/11/helping-kids-and-families-find-high-quality-apps-for-kids.html
- Google Play subscription transparency rules (trial length, price after, how to cancel, easy to dismiss): https://android-developers.googleblog.com/2020/04/building-user-trust-through-more.html
- FTC amended COPPA Rule (effective June 23, 2025; compliance by April 22, 2026), Federal Register: https://www.federalregister.gov/documents/2025/04/22/2025-05904/childrens-online-privacy-protection-rule ; summary of retention-policy and security-program duties, Jones Day: https://jonesday.com/en/insights/2025/05/ftc-finalizes-amendments-to-coppa--rule
- GDPR Article 8 (child consent; parental authorization below 16, member states may lower to 13): https://gdpr-text.com/de/read/article-8
- Expo plans: https://docs.expo.dev/billing/plans.md ; RevenueCat free plan summary (third-party, verify): https://costbench.com/software/subscription-billing/revenuecat/free-plan/ ; R2 and Bunny prices (third-party, verify): https://agentdeals.dev/storage-comparison-2026

Couldn't be opened in this session (permission request timed out):
- App Store Review Guidelines full text, https://developer.apple.com/app-store/review/guidelines/. Read sections 1.3, 3.1.1, 3.1.2, 5.1.1(v) and 5.1.4 there before you submit. Points above that come from prior knowledge rather than an opened page: in-app account deletion (5.1.1(v)); 1.3's carve-out allowing third-party analytics only "in limited cases" with no IDFA or identifiable data; and that the Kids rules keep applying after you leave the category.
- Google Play web search for "little duet".

From prior knowledge, not checked this session (verify before you rely on them): the Google personal-account closed-testing rule (12 testers, 14 days), the USPTO and EUIPO fees, Supabase Pro pricing, and Google's 15% subscription fee.
