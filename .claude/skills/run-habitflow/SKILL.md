---
name: run-habitflow
description: Build, run, and drive HabitFlow (Expo/React Native habit + water tracker app). Use when asked to start HabitFlow, run its web build, take a screenshot of its UI, or interact with the running app to confirm a change works.
---

HabitFlow is an Expo Router app (React Native, target platform Android)
that also ships a web export via `react-native-web`. This container has
no Android SDK/emulator and no `chromium-cli`, so the agent path is:
run `expo start --web`, then drive the page with the Playwright REPL
driver at `.claude/skills/run-habitflow/driver.mjs`, piped commands
one at a time (tmux `send-keys`/`capture-pane` if tmux is available; a
named pipe otherwise — both shown below, both verified working).

All paths below are relative to the repo root (`~/Projects/habitflow`).

## Prerequisites

Chrome is required (Playwright's own bundled Chromium needs
`sudo apt-get install`, which this container's user cannot run
passwordless — so the driver points Playwright at system Chrome
instead):

```bash
which google-chrome   # must exist; driver uses /usr/bin/google-chrome
```

## Setup

```bash
npm install            # installs app deps + the playwright devDependency
npx playwright --version   # sanity check; no browser download needed
```

`playwright` is already a devDependency (added for this driver — it
does not affect the Expo/React Native app itself, only tooling).

## Build

No separate build step for the web dev target — Metro bundles on the fly.

## Run (agent path)

1. Start the Expo web dev server in the background and wait for it to serve:

```bash
nohup npx expo start --web --port 8081 > /tmp/expo.log 2>&1 &
timeout 60 bash -c 'until curl -sf http://localhost:8081 >/dev/null; do sleep 1; done'
```

2. Drive it with the REPL driver. **With tmux** (preferred if installed):

```bash
tmux new-session -d -s habitflow -x 200 -y 50
tmux send-keys -t habitflow 'node .claude/skills/run-habitflow/driver.mjs' Enter
tmux send-keys -t habitflow 'launch' Enter
timeout 30 bash -c 'until tmux capture-pane -t habitflow -p | grep -q READY; do sleep 0.5; done'
tmux send-keys -t habitflow 'tab Habits' Enter
sleep 1
tmux send-keys -t habitflow 'screenshot habits' Enter
tmux capture-pane -t habitflow -p
```

**Without tmux** (verified working in this container — a FIFO gives the
same one-command-at-a-time control):

```bash
mkfifo /tmp/habitflow.fifo
( tail -f /tmp/habitflow.fifo | node .claude/skills/run-habitflow/driver.mjs > /tmp/habitflow-driver.log 2>&1 & )
echo launch > /tmp/habitflow.fifo
timeout 30 bash -c 'until grep -q READY /tmp/habitflow-driver.log; do sleep 0.5; done'
echo 'tab Habits' > /tmp/habitflow.fifo
sleep 1
echo 'screenshot habits' > /tmp/habitflow.fifo
sleep 1
cat /tmp/habitflow-driver.log   # → "SCREENSHOT .../screenshots/habits.png"
echo quit > /tmp/habitflow.fifo
```

Screenshots land in `.claude/skills/run-habitflow/screenshots/<name>.png`.

Driver commands (send one per line, wait ~0.5-2s between commands for
the RN animations/navigation to settle before the next one):

| command | what it does |
|---|---|
| `launch` | opens Chrome, navigates to `http://localhost:8081`, prints `READY` |
| `nav <url>` | navigate to a URL (defaults to the dev server root) |
| `tab <Today\|Habits\|Progress\|Settings>` | click a bottom-tab by accessible name, waits, dismisses any error overlay |
| `tap <exact text>` | click the first element with that exact visible text (e.g. `tap +250`, `tap Stretch 5 min`) |
| `dismiss` | manually dismiss the LogBox error overlay if one is showing |
| `wait <ms>` | pause |
| `screenshot <name>` | save `screenshots/<name>.png` |
| `text` | print the first 800 chars of `body` textContent (debugging only — can include stale/hidden nodes, see Gotchas) |
| `errors` | print captured console.error / pageerror messages seen so far |
| `quit` | close the browser, exit the driver |

Stop the dev server when done: `lsof -ti:8081 -sTCP:LISTEN | xargs -r kill`.

## Run (human path)

```bash
npx expo start
```

Opens the Metro/Expo CLI; scan the QR code with Expo Go on a phone, or
press `w` for web. Useless headless — this is the path a human uses on
their own machine, not this container.

## Test

No test suite is configured (`package.json` has no `test` script).

## Gotchas

- **`#error-toast` silently eats clicks.** React Native Web leaves an
  empty, 0×0, absolutely-positioned `<div id="error-toast">` in the DOM
  at all times. Chromium's hit-testing treats it as intercepting clicks
  at unrelated points on the page (e.g. the bottom tab bar), so a plain
  `page.click()` on a tab can time out with "`#error-toast` intercepts
  pointer events" even though the div is visually nowhere near the
  click point. The driver neutralizes this once at launch with
  `page.addStyleTag({content:'#error-toast:empty{display:none!important}'})`.
  Using `{force:true}` clicks instead "works" but actually fires a raw
  click without the pointerdown/up sequence React Native Web's
  `Pressable` listens for — tab navigation silently does nothing (URL
  doesn't change) even though the click "succeeds." Use the CSS fix,
  not `force:true`.
- **Full-screen LogBox error overlay blocks the app.** `components/WaterRing.tsx`
  (used on both the Today and Habits screens) passes an invalid
  `transform-origin` prop to an SVG `<Circle>` on every mount, which
  Expo's web LogBox promotes to a full-screen `Console Error` overlay
  rendered inside an **open shadow root** at `#error-overlay`
  (`document.getElementById('error-overlay').shadowRoot`). It reappears
  after almost every navigation and blocks all further clicks until
  dismissed. The driver's `tab`/`tap`/`nav` commands call `dismissOverlay()`
  automatically, which finds the shadow-root `<button title="Dismiss error">`
  and clicks it by computed coordinates (regular DOM queries/selectors
  can't reach into the shadow root without piercing it explicitly).
- **`body.textContent` can return a stale/previous screen.** Right after
  a tab switch, `page.textContent('body')` sometimes still returns the
  outgoing screen's text (hidden nodes are apparently still walked).
  The URL (`page.url()`) and a screenshot are reliable; `text`/`body`
  content is not — treat the `text` driver command as a rough debug aid
  only, and confirm real state with `screenshot`.
- **AdMob shows nothing in this environment**, by design — the app only
  requests ads in an EAS dev/production build, never in Expo Go or the
  web dev export. Seeing "Ads show in a Play Store / development build"
  placeholder text is expected, not a bug.
- **Playwright's own Chromium download needs `sudo apt-get`** for
  shared-lib deps, which fails non-interactively in this container
  (`npx playwright install --with-deps chromium` prompts for a sudo
  password and aborts). Point Playwright at the already-installed
  system Chrome instead (`executablePath: '/usr/bin/google-chrome'`),
  which needs no extra install.
- **Run driver scripts from the repo root**, not an absolute path
  elsewhere — `import { chromium } from 'playwright'` resolves via
  Node's normal `node_modules` lookup from the current working
  directory, and `playwright` is only installed under
  `~/Projects/habitflow/node_modules`.

## Troubleshooting

- **`Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'playwright'`**:
  the driver was run from outside the repo, or from a copy of the
  script elsewhere. Run `node .claude/skills/run-habitflow/driver.mjs`
  with cwd = repo root.
- **`sudo: a terminal is required to read the password`** from
  `npx playwright install`: expected in this container — skip browser
  install entirely; the driver uses system Chrome (see Gotchas).
- **`locator.click: Timeout ... <div id="error-toast"> intercepts
  pointer events`**: the page was navigated outside the driver (so the
  `#error-toast:empty{display:none}` style tag was never injected).
  Always go through `driver.mjs`'s `nav`/`launch` commands, which add
  it right after `page.goto`.
- **Tab click "succeeds" (no error) but the screen doesn't change**:
  almost always caused by using `{force:true}` on the click instead of
  fixing the `#error-toast` hit-testing issue — see Gotchas.
