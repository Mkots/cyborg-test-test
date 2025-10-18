import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import { cleanEnv, str, url } from 'envalid';

dotenv.config();

const env = cleanEnv(process.env, {
  CT_SERVER_URL: url(),
  CT_TOKEN: str(),
  CI_COMMIT_BRANCH: str({ default: 'local' }),
});


export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
    reporter: [
    ['blob', { outputFile: 'test-results/blob.zip' }],
    ['github'],
    [
      '@cyborgtests/reporter-playwright-reports-server',
      {
        enabled: true,
        url: env.CT_SERVER_URL,
        token: env.CT_TOKEN,
        requestTimeout: 60000,
        reportPath: 'test-results/blob.zip',
        resultDetails: {
          branch: env.CI_COMMIT_BRANCH,
          foo: 'bar',
          bar: 'baz'
        },
        triggerReportGeneration: false
      },
    ],
  ],
  use: {
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

  ],

});
