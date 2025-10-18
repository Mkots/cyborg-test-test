import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import { cleanEnv, str, url } from 'envalid';

dotenv.config();

const env = cleanEnv(process.env, {
  CT_SERVER_URL: url(),
  CT_TOKEN: str(),
  CI_COMMIT_BRANCH: str({ default: 'local' }),
});

function formatDate(date: Date = new Date()): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}


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
        testRun: `Run ${formatDate()}`,
        reportPath: 'test-results/blob.zip',
        resultDetails: {
          branch: env.CI_COMMIT_BRANCH,
          foo: 'bar',
          bar: 'baz'
        },
        triggerReportGeneration: true
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
