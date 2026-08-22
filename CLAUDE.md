# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

Expo SDK 57 / React Native 0.86 / React 19.2 — APIs have moved since older SDKs.
Check the versioned docs above before writing Expo-facing code.

## Commands

```bash
npx expo start            # Metro + QR code for Expo Go (npm start)
npx expo start --web      # web dev server (npm run web) — the only headless-drivable target
npx tsc --noEmit          # typecheck; strict mode, currently clean. No lint or test runner is configured.
npx expo run:android      # local native build (needs Android SDK)
```

Builds and releases go through EAS (`eas build -p android --profile preview|production`);
`eas.json` uses `appVersionSource: "local"`, so production builds bump
`expo.android.versionCode` in `app.json` and that change must be committed.

To actually run the app and see a change, use the `run-habitflow` skill —
it documents the `expo start --web` + Playwright driver path
(`.claude/skills/run-habitflow/driver.mjs`) and the React Native Web quirks
(`#error-toast` swallowing clicks, the LogBox shadow-root overlay) that break
naive browser automation here.

## Architecture

Expo Router file-based app: `app/_layout.tsx` (fonts, splash, ads init, themed
navigation, global `CelebrationModal`) wraps `app/(tabs)/` — Today, Habits,
Progress, Settings — plus `app/modal.tsx` for habit add/edit. `@/*` maps to the
repo root; typed routes are on.

### Single state container

`context/AppProvider.tsx` is the whole app's state. Screens never touch
storage or the gamification helpers directly — they call `useApp()`,
`useHabits()`, or `useDailyProgress()`.

- All of `PersistedState` (`lib/types.ts`) lives in one object, persisted as one
  AsyncStorage key (`habitflow.state.v1`) via `lib/storage.ts`, which
  coalesces writes (`scheduleSave`), re-validates every field on load
  (`parseState`), and prunes logs past their retention window.
- Water history is two-tier. Individual sips (`waterLogs`) are kept for 90 days
  so they can be undone; `pruneState` folds them into `waterDaily`
  (`YYYY-MM-DD` -> ml), an all-time per-day rollup that is **never** pruned —
  that is what the Water history screen charts over years. `waterMlOnDay`
  prefers the logs while a day still has them and falls back to the rollup, and
  every water write re-derives the day through `syncWaterDay`, so an undo takes
  the day back off both tiers.
- Every write goes through `commit`, which updates a `stateRef` *and* React
  state. Deriving next state inside a `setState` updater is deliberately avoided:
  callers read results back synchronously (celebration payloads, unlock outcomes)
  and React may defer the updater.
- `applyMutation(recipe, {celebrate, extraXp})` is the standard write path — it
  runs the recipe, re-derives all day-scoped awards through `applyTodayAwards`,
  and optionally raises a celebration. Use `update()` only for writes that can
  award nothing (renames, toggles that are not tasks).

### Awards are derived, never incremented ad hoc

`lib/gamification.ts` is pure functions over `PersistedState`. XP, gems, streak,
perfect days and achievements are recomputed from the state on every mutation
and are idempotent per day via `*AwardedDate` fields — untoggling a habit
*reverses* the award. `settleStreak` walks forward from `lastSettledDate` to
close out missed days (spending a streak freeze where available) and runs on
load, on resume, and at local midnight (`useLocalToday`).

Daily-goal semantics live here and are easy to get wrong: a *task* is a habit,
plus the water goal when `waterCountsAsTask` — the user opted in, or water is
the only thing tracked (otherwise a water-only setup could never hit a goal).
A *perfect day* is stricter and separate: every habit **and** the water goal.

### Dates are local-day strings

`lib/dates.ts` — every day key is a `YYYY-MM-DD` string built from local
components (`todayKey`, `addDays`, `localDayOf`). Never compare timestamps or
use UTC dates for day logic; string comparison on these keys is the ordering.

### Ads

`lib/ads.ts` (native) / `lib/ads.web.ts` (web stub, resolved by Metro platform
extension) wrap `react-native-google-mobile-ads` behind `require()` so the app
runs in Expo Go and on web, where the native module is absent
(`isAdMobAvailable()`). Rules baked in:

- No ad is requested before UMP consent allows it (`canRequestAds`), and
  `subscribeToAdsReady` re-renders `AdBanner` once it does.
- Unit IDs come from `expo.extra.ads` in `app.json`. Google *test* IDs are used
  only under `__DEV__`; a release build with a test ID requests nothing rather
  than shipping test ads to Play.
- Rewarded unlocks (extra habit slots, streak freezes) grant in `__DEV__` when
  AdMob is unavailable, and fail closed in production.

### Theming and layout

`constants/Colors.ts` (light/dark palettes + `Gradients`) and
`constants/Fonts.ts` (Plus Jakarta Sans) are the only sources for color and
type; `components/Themed.tsx` provides the themed `Text`/`View` primitives.
`theme.track` — not `backgroundAlt` — is the token for a recessed surface drawn
*on* a card (progress tracks, empty dots, locked badges): on dark it is lighter
than `card`, so it reads as raised rather than as a hole.

### Internationalization

English, French, Chinese and Spanish. `lib/i18n/en.ts` is the source of truth
and exports `Messages = typeof en`; `fr.ts` / `zh.ts` / `es.ts` are declared as
`Messages`, so a missing or mis-signatured key is a **compile error**, not a
blank label. Parameterised strings are functions (`captionLeft: (left: number)
=> …`), which keeps plural rules, word order, decimal separators (`1,5 L` in
fr/es) and date order inside the language that needs them.

Screens call `useT()` from `context/I18nContext.tsx` and never hardcode user
text — including accessibility labels, alert copy, month and weekday names, and
`t.formatMl()`. `lib/dates.ts` deliberately has no formatting or wording left in
it. Things that are data keep only their identity: `ACHIEVEMENTS` carries
`{ id, emoji }` and the title/description come from `t.achievements[id]`.

`lib/notifications.ts` takes its copy pre-translated (`ReminderStrings`) because
it runs outside React; `AppProvider` resolves it with `messagesFor(state.language)`
and puts it in `reminderPlanKey`, so changing language reschedules the reminders.
`language` (`system` | `en` | `fr` | `zh` | `es`) is persisted like any other
field, and `system` resolves through `expo-localization`, falling back to English
for any device language HabitFlow does not speak. Language and appearance both
survive *Erase all my data* — they are how the app is read, not data about the user.

`useColorScheme()` resolves the saved `themePreference` (`system` | `light` |
`dark`, set from Settings › Appearance) over the device scheme, so an explicit
choice overrides the phone in both directions. The preference is served by
`context/ThemeContext.tsx`, deliberately a separate context from `AppProvider`
so the hook never depends on the whole app state. The web variant of the hook
renders light during SSR and swaps after mount to avoid a hydration mismatch.
The tab bar floats (absolutely positioned), so it reserves no layout space —
screens must pad their bottom with `useTabBarSpace().clearance`.

## Release checklist

README.md carries the Play Store submission requirements (privacy policy URL and
support email in `expo.extra`, Data safety declaration for the AdMob advertising
ID, versionCode bump, real iOS AdMob app ID). Keep it in sync when those change.
