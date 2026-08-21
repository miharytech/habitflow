# HabitFlow

Water reminder + daily habit tracker for Android, built with Expo. Clone of apps like WaterMinder / Streaks, with ads so you can earn money later.

## Run it now

```bash
cd ~/Projects/habitflow
npx expo start
```

Scan the QR code with Expo Go. In Expo Go, ads show as a placeholder. Real AdMob ads need a development or Play Store build (native SDK).

## What is in v1

- Daily water goal with quick-add buttons and a progress ring
- Habit checklist with streaks
- A daily goal of N tasks, XP, gems, levels, streak freezes and achievements
- Optional local reminders at 8:00, 11:00, 14:00, 17:00, 20:00
- Banner ads on Today, Habits and Progress
- Interstitial when you hit the water goal (once per day)
- Rewarded ad to unlock extra habit slots (4 are free)

Data stays on the phone (AsyncStorage). No account required.

## How the daily goal works

Your daily goal is a number of **tasks**, set in Settings (1, 2, 3 or everything).
Each habit is one task. When **Water counts as a daily task** is on, hitting your
water goal is one task too — so water + one habit satisfies a goal of 2. With the
setting off, water only earns bonus XP and does not count toward the goal. If you
track nothing but water, the water goal always counts, otherwise the goal would be
unreachable.

A **perfect day** is stricter and unchanged: every habit plus the water goal.

## Ads (Madagascar)

AdMob is the right network: Google lists **Madagascar** and pays by **international wire transfer** (no PayPal). Threshold is about **$100**.

Until you have an AdMob account, the app uses Google **test** ads in development only. Release builds will not request ads until you add real unit IDs (this avoids shipping Google test IDs to Play Store). After Play Console + AdMob setup:

1. Create an AdMob app for Android
2. Create banner, interstitial, and rewarded ad units
3. Put your real `androidAppId` / `iosAppId` in `app.json` (the `ca-app-pub-...~...` value)
4. Put your banner, interstitial, and rewarded unit IDs in `expo.extra.ads` in `app.json`
5. Rebuild with EAS

PayPal is a poor payout option from Madagascar. Use a bank that can receive SWIFT wires.

## Publish to Play Store

```bash
npm i -g eas-cli
eas login
eas build:configure
eas build -p android --profile preview   # APK to test on your phone
eas build -p android --profile production
eas submit -p android --profile production
```

AdMob does not work in Expo Go. Use `eas build --profile development` (or preview/production) for real ads.

Play Console developer account is a one-time $25 USD fee.

### Before you submit

- [ ] **Privacy policy.** Host one (GitHub Pages is enough) and put the URL in
      `expo.extra.privacyPolicyUrl` in `app.json`. Play requires it because the
      app serves ads, and AdMob requires it too. The Settings entry stays hidden
      while the value is empty rather than shipping a dead link. Add the same URL
      to the Play Console listing.
- [ ] **Support email** in `expo.extra.supportEmail` (optional in the app, but the
      Play listing needs a contact address).
- [ ] **Play Data safety form.** HabitFlow itself stores everything on-device and
      uploads nothing, but Google AdMob collects the advertising ID and device
      data — declare that.
- [ ] **Bump `expo.android.versionCode`** for every upload. `eas.json` uses
      `appVersionSource: "local"` with `autoIncrement` on the production profile,
      so EAS bumps it in `app.json` — commit that change.
- [ ] **iOS AdMob app ID** in `app.json` is still Google's test ID. Irrelevant for
      Play, but replace it before any App Store release.

EEA consent (the Google UMP form), the family-safe `maxAdContentRating`, and the
"Ad privacy options" entry in Settings are already wired up in `lib/ads.ts`; no ad
is requested until consent allows it.
