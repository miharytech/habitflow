# Publishing HabitFlow to Google Play — step by step

Everything after the preview APK. Run all commands from the repo root
(`~/Projects/habitflow`). In Claude Code, prefix a command with `!` to run it
in the session.

Facts this guide assumes (from `app.json` / `eas.json`):

| | |
|---|---|
| Package name | `com.miharytech.habitflow` (**permanent** after the first upload) |
| Version | `1.0.0`, versionCode `1` |
| Privacy policy | https://miharytech.github.io/habitflow/ |
| Support email | miharyjoel@gmail.com |
| EAS project | `ad3e0fc6-6efb-4180-94c6-2f2e214c4230` |
| Version source | `appVersionSource: "local"` — versionCode lives in `app.json` and **must be committed** |

---

## Step 0 — Test the preview APK

Download the APK from the build URL EAS prints (or from
https://expo.dev/accounts/miharyjoel/projects/habitflow/builds), install it on
your phone, and check the things the web export cannot show:

- [ ] Real AdMob banner appears on Today
- [ ] Rewarded unlock (extra habit slot / streak freeze) grants after the video
- [ ] Notification permission prompt, and a reminder actually fires
- [ ] Dark mode — Settings › Appearance (never testable on web, the web hook hardcodes light)
- [ ] Language switching (system / en / fr / zh / es), including reminder text
- [ ] Water goal alone counts toward the daily task count
- [ ] Kill and reopen the app: streak, XP, gems, water history all survive

Fix anything broken, commit, and rebuild preview before moving on.

---

## Step 1 — Back up the keystore (do this once, do not skip)

EAS generated an upload keystore for you. If you lose it **and** Play App
Signing is not enabled, you can never update the app again.

```bash
npx eas-cli credentials -p android
```

Choose the `production` (or any) profile → `Keystore: Manage everything…` →
`Download existing keystore`. Save the `.jks` file **and the printed passwords**
(keystore password, key alias, key password) somewhere safe and off this
machine. Do not commit them — they are secrets.

---

## Step 2 — Build the production AAB

```bash
npx eas-cli build -p android --profile production
```

- Produces an `.aab` (Play requires app bundles, not APKs). You cannot sideload it.
- `autoIncrement: true` bumps `expo.android.versionCode` in `app.json` **on your disk**.

Commit that bump immediately, or the next build reuses the same versionCode and
Play rejects it:

```bash
git add app.json && git commit -m "chore: bump versionCode for release"
```

Takes ~20 min. Download the `.aab` from the URL EAS prints.

---

## Step 3 — Play Console: create the internal testing release

Play Console → your HabitFlow app → **Test and release › Testing › Internal testing**
→ *Create new release*.

1. **App signing** — accept Play App Signing when prompted (recommended: Google
   holds the real signing key, your EAS keystore is only the upload key, so a
   lost keystore is recoverable).
2. **Upload** the `.aab`.
3. **Release name** — `1.0.0 (1)` is fine.
4. **Release notes** — write something real; `<en-US>First release of HabitFlow.</en-US>`
5. Save → *Review release* → *Start rollout to Internal testing*.

⚠️ **The first upload permanently locks `com.miharytech.habitflow`.** You can
never rename it or reuse it for another app. Confirm it is what you want before
uploading.

Then add testers: **Testers** tab → create an email list with your own address →
save → copy the opt-in link, open it on your phone, accept, and install from Play.

---

## Step 4 — Play Console: store listing

**Grow › Store presence › Main store listing**

| Field | Notes |
|---|---|
| App name | HabitFlow (max 30 chars) |
| Short description | max 80 chars |
| Full description | max 4000 chars |
| App icon | 512×512 PNG, 32-bit, no transparency |
| Feature graphic | 1024×500 PNG/JPG, **required** |
| Phone screenshots | **min 2**, 16:9 or 9:16, each side 320–3840 px |

Get screenshots by running the preview APK on your phone and taking real
screenshots (Today, Habits, Progress, Water history, Settings — 5 is a good set).

**Grow › Store presence › Store settings** — app category (Health & Fitness),
tags, contact email (`miharyjoel@gmail.com`), and the privacy policy URL.

---

## Step 5 — Play Console: App content declarations

**Monitor and improve › Policy › App content.** Every item must be green before
you can go to production.

1. **Privacy policy** → `https://miharytech.github.io/habitflow/`
2. **Ads** → **Yes, my app contains ads** (AdMob banners + rewarded video).
3. **App access** → all functionality available without restrictions (no login).
4. **Content rating** → fill the questionnaire. HabitFlow is a utility with no
   user-generated content, no violence, no gambling → expect Everyone / PEGI 3.
5. **Target audience and content** → target age 13+ (or 18+). Do **not** select
   an under-13 audience: that triggers Families policy and would force
   child-directed ad settings the app does not use.
6. **News app** → No. **COVID-19 apps** → No. **Data safety** → see below.
7. **Government apps** → No. **Financial features** → None.
8. **Health apps** → HabitFlow is a general wellness tracker, not a medical app.

### Data safety (the one people get wrong)

The app itself stores everything on-device and collects nothing. **But AdMob
does**, and Google holds you responsible for your SDKs. Declare:

- **Does your app collect or share any of the required user data types?** → **Yes**
- **Device or other IDs** → collected **and** shared, for **Advertising or marketing**
  — this is the advertising ID used by AdMob.
- **App activity › Other actions** (ad interactions) → collected and shared,
  Advertising or marketing.
- **App info and performance › Diagnostics / Crash logs** → only if you add
  crash reporting; you have none, so leave unchecked.
- Data is **not** encrypted-in-transit-declarable by you for third-party SDKs —
  answer **Yes, data is encrypted in transit** (AdMob uses HTTPS).
- **Can users request data deletion?** → Yes; point to the support email.
  Settings › *Erase all my data* wipes local data.

Everything else — habits, water logs, streaks — is **not collected**: it never
leaves the device.

---

## Step 6 — Promote to production

Once the internal test build works on your phone and all App content items are
green:

**Test and release › Production** → *Create new release* → *Add from library*
(pick the same AAB, do not rebuild) → release notes → *Review* → *Start rollout
to Production*.

First review typically takes a few days to ~2 weeks for a new developer account.

---

## Step 7 — After the app is live

**Link the store listing in AdMob.** AdMob → Apps → HabitFlow → *Add an app
store* / *Ajouter un magasin d'applications* → search for the published listing
and link it. This clears "Examen requis" and lifts *limited ad serving*, which
otherwise throttles your fill rate and revenue.

---

## Shipping an update later

```bash
# 1. edit expo.version in app.json if the user-visible version changed (1.0.0 -> 1.0.1)
npx eas-cli build -p android --profile production   # autoIncrement bumps versionCode
git add app.json && git commit -m "chore: bump version"
```

Then upload the new `.aab` to Internal testing, verify, and promote to
Production. versionCode must strictly increase; Play rejects reuse.

### Optional: automate the upload with `eas submit`

`eas.json` already has `submit.production.android.track: "internal"`. To use it
you need a Google Play service-account JSON key:

Play Console → *Setup › API access* → link a Google Cloud project → create a
service account → grant it *Release manager* → download the JSON key.

```bash
npx eas-cli submit -p android --profile production
```

Point it at the key when asked (or add
`"serviceAccountKeyPath": "./play-service-account.json"` under
`submit.production.android` in `eas.json`). **Add that JSON file to
`.gitignore`** — it is a credential.

---

## Known gaps

- `ios.config.googleMobileAdsAppId` is still Google's **test** app ID
  (`ca-app-pub-3940256099942544~1458002511`). Harmless for Play; replace it with
  your real iOS AdMob app ID before any App Store release.
