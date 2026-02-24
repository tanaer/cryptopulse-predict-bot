import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure"
  },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
    { name: "chrome", use: { browserName: "chromium", channel: "chrome" } }
  ],
  webServer: {
    command: "npm run start",
    url: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 180_000
  }
});

