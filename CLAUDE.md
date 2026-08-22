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
The tab bar floats (absolutely positioned), so it reserves no layout space —
screens must pad their bottom with `useTabBarSpace().clearance`.

## Release checklist

README.md carries the Play Store submission requirements (privacy policy URL and
support email in `expo.extra`, Data safety declaration for the AdMob advertising
ID, versionCode bump, real iOS AdMob app ID). Keep it in sync when those change.
