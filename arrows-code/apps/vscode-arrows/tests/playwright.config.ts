import { defineConfig, devices } from '@playwright/test';

/**
 * E2E tests for the arrows-ts embed bundle that the VS Code extension ships.
 * Drives the same /embed.html the webview loads, captures the postMessage
 * stream the bridge emits, and asserts on user-visible outcomes after real
 * mouse interactions on the canvas.
 *
 * Tests run against the arrows-ts Vite dev server (port 4200) - the same one
 * `nx serve arrows-ts` starts. The server is launched automatically below.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // canvas tests use shared port; keep deterministic
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'line' : 'list',
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npx vite --port 4200',
    cwd: '../../../../apps/arrows-ts',
    url: 'http://localhost:4200/embed.html',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
