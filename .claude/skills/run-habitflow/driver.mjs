#!/usr/bin/env node
// REPL driver for HabitFlow's web export (react-native-web via Expo).
// Reads one command per line from stdin, keeps a single browser/page alive
// across commands. Meant to be run under tmux so an agent can send-keys /
// capture-pane one command at a time. See SKILL.md for the command list
// and the gotchas this driver works around.

import { chromium } from 'playwright';
import readline from 'node:readline';
import path from 'node:path';
import fs from 'node:fs';

const URL = process.env.HABITFLOW_URL || 'http://localhost:8081';
const SHOT_DIR = process.env.HABITFLOW_SHOTS || path.join(process.cwd(), '.claude/skills/run-habitflow/screenshots');
fs.mkdirSync(SHOT_DIR, { recursive: true });

const CHROME_PATH = process.env.CHROME_PATH || '/usr/bin/google-chrome';

let browser, page;
const consoleErrors = [];

async function launch() {
  browser = await chromium.launch({ executablePath: CHROME_PATH, args: ['--no-sandbox'] });
  page = await browser.newPage({ viewport: { width: 420, height: 900 } });
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', (err) => consoleErrors.push(String(err)));
  await page.goto(URL, { waitUntil: 'load' });
  // #error-toast is a persistent 0x0 absolutely-positioned div React Native Web
  // leaves in the DOM. Empty, it still intercepts clicks at some hit-test
  // points (Chromium quirk with 0-size absolutely positioned elements), which
  // silently swallows every tab/button click. Hiding it when empty is enough.
  await page.addStyleTag({ content: '#error-toast:empty{display:none !important}' });
  await page.waitForTimeout(2000);
}

// Metro/Expo's web LogBox renders a full-screen error overlay (inside an
// open shadow root at #error-overlay) whenever a component logs a
// console.error-level warning — which WaterRing.tsx does on every mount
// (invalid `transform-origin` SVG DOM prop). The overlay covers the whole
// viewport and blocks every subsequent click until dismissed, so we clear
// it after every navigation/tap.
async function dismissOverlay() {
  for (let i = 0; i < 5; i++) {
    const rect = await page.evaluate(() => {
      const el = document.getElementById('error-overlay');
      if (!el || !el.shadowRoot) return null;
      const btn = [...el.shadowRoot.querySelectorAll('button')].find((b) => b.title === 'Dismiss error');
      if (!btn) return null;
      const r = btn.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    });
    if (!rect) return;
    await page.mouse.click(rect.x, rect.y);
    await page.waitForTimeout(250);
  }
}

async function tab(name) {
  await page.getByRole('tab', { name: new RegExp(name, 'i') }).click();
  await page.waitForTimeout(800);
  await dismissOverlay();
}

async function tap(text) {
  await page.getByText(text, { exact: true }).first().click();
  await page.waitForTimeout(500);
  await dismissOverlay();
}

// Switches, sliders and icon-only buttons carry no visible text, so `tap`
// cannot reach them. Address them by accessible role + name instead.
async function role(spec) {
  const [name, ...rest] = spec.split(/\s+/);
  await page.getByRole(name, { name: new RegExp(rest.join(' '), 'i') }).first().click();
  await page.waitForTimeout(500);
  await dismissOverlay();
}

async function screenshot(name) {
  const file = path.join(SHOT_DIR, `${name || 'shot'}.png`);
  await page.screenshot({ path: file });
  console.log('SCREENSHOT', file);
}

const rl = readline.createInterface({ input: process.stdin });
rl.on('line', async (line) => {
  const [cmd, ...rest] = line.trim().split(/\s+/);
  const arg = rest.join(' ');
  try {
    switch (cmd) {
      case 'launch':
        await launch();
        console.log('READY');
        break;
      case 'nav':
        await page.goto(arg || URL, { waitUntil: 'load' });
        await page.waitForTimeout(1000);
        await dismissOverlay();
        console.log('OK nav');
        break;
      case 'tab':
        await tab(arg);
        console.log('OK tab', arg);
        break;
      case 'tap':
        await tap(arg);
        console.log('OK tap', arg);
        break;
      case 'role':
        await role(arg);
        console.log('OK role', arg);
        break;
      case 'dismiss':
        await dismissOverlay();
        console.log('OK dismiss');
        break;
      case 'wait':
        await page.waitForTimeout(Number(arg) || 500);
        console.log('OK wait');
        break;
      case 'screenshot':
        await screenshot(arg);
        break;
      case 'text':
        console.log('TEXT', (await page.textContent('body')).slice(0, 800));
        break;
      case 'errors':
        console.log('ERRORS', JSON.stringify(consoleErrors));
        break;
      case 'quit':
        await browser.close();
        console.log('BYE');
        process.exit(0);
        break;
      default:
        console.log('ERR unknown command:', cmd);
    }
  } catch (e) {
    console.log('ERR', e.message);
  }
});
