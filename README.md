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
- Optional local reminders at 8:00, 11:00, 14:00, 17:00, 20:00
- Banner ads on Today and Habits
- Interstitial when you hit the water goal (once per day)
- Rewarded ad to unlock extra habit slots (4 are free)

Data stays on the phone (AsyncStorage). No account required.

## Ads (Madagascar)

AdMob is the right network: Google lists **Madagascar** and pays by **international wire transfer** (no PayPal). Threshold is about **$100**.

Until you have an AdMob account, the app uses Google **test** app IDs in `app.json`. After Play Console + AdMob setup:

1. Create an AdMob app for Android
2. Create banner, interstitial, and rewarded ad units
3. Put your real `androidAppId` in `app.json` (the `ca-app-pub-...~...` value)
4. Replace `TestIds.*` in `lib/ads.ts` with your ad unit IDs (`ca-app-pub-.../...`)
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

Play Console developer account is a one-time $25 USD fee. You will also need a privacy policy URL (GitHub Pages is enough) because the app uses ads and notifications.
