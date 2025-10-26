import { test, expect } from '@playwright/test';
import {coverageToHtmlString} from "../../coverage-reporter";

test('has title', async ({ page }, testInfo) => {
await page.coverage.startJSCoverage();
  await page.goto('https://playwright.dev/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Playwright/);
    const cov = await page.coverage.stopJSCoverage();

    // Process coverage data somehov convert v8 to html
    const htmlString=  await coverageToHtmlString(cov as any)

    await testInfo.attach('coverage.html', {
        body: htmlString,
        contentType: 'text/html',
    });
});

test('get started link', async ({ page }) => {
    await page.coverage.startJSCoverage();
  await page.goto('https://playwright.dev/');

  // Click the get started link.
  await page.getByRole('link', { name: 'Get started' }).click();

  // Expects page to have a heading with the name of Installation.
  await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
    await page.coverage.stopJSCoverage();
});
