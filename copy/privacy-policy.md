# Little Duet Privacy Policy

> **Not legal advice.** This is a working draft written for a kids' app with the data practices described below. Have a qualified lawyer review it in each country where you launch, then fill in every `[PLACEHOLDER]` before you publish. If the app's data practices change, update this policy, the App Store privacy label and the Google Play Data safety form at the same time.

**Effective date:** [EFFECTIVE_DATE]
**Last updated:** [LAST_UPDATED_DATE]

Little Duet is a piano app for a grown-up and a child aged 2 to 6 to use together. This policy explains what information the app handles, why, and the choices you have. We wrote it for parents, in plain words.

**The short version**

- Little Duet has no ads, no third-party analytics and no tracking.
- The app never uses the microphone or camera and never records your child.
- In guest mode, which is the default, your child's nickname, age group, progress, stars and stickers stay on your device.
- If a grown-up chooses to create an account, we store the grown-up's email address and the child's progress so it can sync. Nicknames stay on the device.
- Apple or Google handles payments. We never see card details.
- You can delete everything, at any time, from inside the app.

## 1. Who we are

Little Duet is run by [COMPANY_LEGAL_NAME], [COMPANY_ADDRESS] ("we", "us"). We are the operator of the app under the US Children's Online Privacy Protection Act (COPPA) and the controller of personal data under the EU and UK General Data Protection Regulation (GDPR).

Contact us at [CONTACT_EMAIL] or by post at the address above.

[IF REQUIRED: EU representative under GDPR Article 27: [EU_REPRESENTATIVE_NAME_AND_ADDRESS]. UK representative: [UK_REPRESENTATIVE_NAME_AND_ADDRESS]. Data protection officer, if appointed: [DPO_CONTACT].]

## 2. How the app is built for children

Little Duet is made for young children, played with a grown-up. We designed it to collect as little as possible:

- The child-facing parts of the app (songs, classes, the piano, stickers) collect no personal information from your child. Your child never types an email, a full name, a photo, a voice recording or a location.
- There is no chat, no messaging, no social feed, and no way for children to share content or contact anyone.
- Settings, the account screen, purchases and every link that leaves the app sit behind a grown-ups-only check (a "parental gate").
- We do not use advertising identifiers (Apple IDFA or Android advertising ID), and we do not request location, contacts, photos, microphone or camera access.

## 3. Information we handle

### 3.1 Stored only on your device (guest mode and account mode)

| Information | Why | Where it lives |
|---|---|---|
| Child's nickname, which a grown-up types | To show it in the app and cheer your child on | Your device only. It is not sent to us, even with an account. |
| Child's age group (for example "Tiny Ears, 2-3") and chosen picture | To suggest songs that fit | Your device. Also synced if you create an account (see 3.2). |
| Progress: which classes were started or finished, playback position, stars, stickers, badges, favorites | To run the app, including "Continue" | Your device. Also synced if you create an account. |
| Settings: preferred piano mode, caption size, reminder time | To remember your choices | Your device |

Daily and trial reminders are local notifications created on your device. We do not use a push-notification service and we do not hold a push token.

We never ask for a birth date. We use an age group only.

### 3.2 Optional grown-up account

A grown-up can create an account to back up progress and use it on more than one device. Accounts are for adults only. To create one, a grown-up passes the parental gate and enters an email address.

| Information | Why | Legal basis (GDPR) |
|---|---|---|
| Grown-up's email address | To sign you in with a one-time code, and to send messages about your account (for example a sign-in code or a deletion confirmation) | Performance of our contract with you |
| Account ID (a random identifier) | To link your synced progress to your account | Performance of contract |
| Synced child profile data: a random profile ID, age group, chosen picture | So progress appears on your other devices | Performance of contract |
| Synced progress: classes, positions, stars, stickers, badges, favorites, timestamps | So progress appears on your other devices | Performance of contract |

We do not send marketing email unless you opt in separately. [IF YOU ADD A NEWSLETTER LATER, ADD A SEPARATE OPT-IN AND DESCRIBE IT HERE.]

### 3.3 Purchases

Subscriptions are bought through the Apple App Store or Google Play. Apple or Google processes the payment under its own privacy policy. We never receive your card number or billing address.

We use RevenueCat, Inc. to check whether a subscription is active. RevenueCat receives:

- A random, anonymous app user ID created on your device. We do not give RevenueCat your email address, your account ID or your child's nickname.
- Purchase and subscription records from Apple or Google: product, price, currency, dates, trial status, renewal and cancellation status, and transaction IDs.
- Basic technical details needed to process the request, such as app version, platform, country or storefront, and the IP address of the request.

We use this to unlock the full songbook, restore purchases, prevent fraud, and see total subscription numbers. Legal basis: performance of contract, and our legitimate interest in preventing fraud.

### 3.4 Delivering lesson videos and app updates

Lesson videos stream from our content delivery network, [VIDEO_CDN_PROVIDER, e.g. Cloudflare R2 or Bunny.net]. App updates are delivered through Expo (EAS Update), run by 650 Industries, Inc. Like any internet service, these providers receive your device's IP address and basic request details (such as the file requested, app version and device type) so they can send the file. We set these services to keep access logs only for security and troubleshooting, for no longer than [LOG_RETENTION_DAYS, e.g. 30] days, and we do not use them to profile anyone. Legal basis: our legitimate interest in delivering the app reliably and securely.

### 3.5 When you contact us

If you email us, we receive your email address and whatever you include. We use it only to answer you. Please don't send us your child's personal details.

### 3.6 What we do not collect

No advertising identifiers. No location. No contacts. No photos, video or audio of you or your child. No microphone input. No third-party analytics or crash-reporting SDKs. No social logins. No data from other apps or websites. We do not track you across apps or websites, and we do not build advertising profiles.

## 4. Children's privacy (COPPA)

Little Duet is directed to children under 13 and is designed so that children do not provide personal information to us.

- **Child-facing areas:** collect no personal information from children. The nickname a grown-up enters stays on the device.
- **Grown-up account:** only an adult can create one, behind the parental gate. The email address belongs to the adult. Synced progress is linked to the adult's account through random IDs and does not include the child's name.
- **Third parties:** we do not sell, rent or share children's information. We do not disclose it to third parties for advertising. The service providers in section 5 process data only on our behalf.
- **Your rights as a parent:** you can review the information linked to your account, ask us to delete it, and refuse further collection at any time. Use the in-app tools in section 8 or email [CONTACT_EMAIL]. We may ask you to confirm the request from the email address on the account.

If we learn we have collected personal information from a child in a way this policy doesn't describe, we will delete it promptly.

## 5. Service providers

We use a small number of providers who process data only on our instructions, under contracts that protect it.

| Provider | What they do | Data involved |
|---|---|---|
| [BACKEND_PROVIDER, e.g. Supabase, Inc.] | Hosts accounts and synced progress. Region: [DATA_REGION] | Grown-up email, account ID, synced progress |
| RevenueCat, Inc. | Checks subscription status | Anonymous app user ID, purchase records |
| Apple Inc. / Google LLC | App distribution and payments, under their own policies | Purchase details you give them |
| [VIDEO_CDN_PROVIDER] | Streams lesson videos | IP address, request details |
| 650 Industries, Inc. (Expo) | Delivers app updates | IP address, app version, device type |
| [EMAIL_DELIVERY_PROVIDER, e.g. the backend provider's email service] | Sends sign-in codes | Grown-up email address |

We do not sell personal information, and we do not "share" it for cross-context behavioral advertising as California law uses that term.

## 6. International transfers

Some providers are in the United States or other countries outside your own. When we transfer personal data out of the EU, EEA or UK, we rely on an adequacy decision (such as the EU-US Data Privacy Framework, where the provider is certified) or on Standard Contractual Clauses. [CONFIRM FOR EACH PROVIDER.]

## 7. How long we keep information (data retention policy)

| Information | How long |
|---|---|
| Data stored only on your device | Until you delete it in the app, remove the child profile, or delete the app |
| Grown-up account email, account ID, synced progress | While the account exists. Deleted within 30 days after you delete the account, and removed from backups within [BACKUP_RETENTION_DAYS, e.g. 35] days after that |
| Accounts with no sign-in for [INACTIVITY_PERIOD, e.g. 24 months] | We email the grown-up, then delete the account if there is no reply within 30 days |
| Purchase records held by RevenueCat | While needed to provide the subscription and meet tax and accounting rules, then deleted or anonymized. You can ask us to delete your RevenueCat record at any time |
| CDN and update-service access logs | Up to [LOG_RETENTION_DAYS] days |
| Support emails | Up to 24 months after the conversation ends |

We keep information only as long as needed for the purposes above, and then delete it.

## 8. Your choices and rights

**In the app (Grown-ups area):**
- **Remove a child:** deletes that child's profile and progress from the device and from sync.
- **Erase data on this device:** removes every profile, star and sticker from the device.
- **Delete account:** permanently deletes your account, email and synced progress from our servers. Deleting the account does not cancel a subscription; cancel that in your Apple or Google account settings.
- **Reminders:** turn daily reminders on or off any time.

**By email** at [CONTACT_EMAIL], you can ask to access, correct, delete or export your data, object to or restrict processing, or ask any question. We reply within 30 days.

**If you are in the EU, EEA or UK,** you also have the right to complain to your data protection authority, for example [LEAD_SUPERVISORY_AUTHORITY].

**If you are in California or another US state with a privacy law,** you have rights to know, delete and correct personal information, and to not be discriminated against for using them. We do not sell or share personal information.

## 9. Security

We keep a written information security program. It includes encryption in transit (HTTPS) for everything the app sends, encryption at rest with our backend provider, access limited to staff who need it, two-factor authentication on our admin accounts, and a yearly review of our providers and practices. No system is perfectly secure. If a breach affects your information, we will tell you and the authorities as the law requires.

## 10. Changes to this policy

If we change this policy, we will update the date at the top. If a change affects how we handle information about children, or needs new consent, we will tell grown-up account holders by email and ask for consent where the law requires it, before the change takes effect.

## 11. Contact

[COMPANY_LEGAL_NAME]
[COMPANY_ADDRESS]
[CONTACT_EMAIL]
