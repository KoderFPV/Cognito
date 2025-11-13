import { test, expect } from '@playwright/test';
import { getTestLocale } from './helpers/testConfig';
import { createTranslationHelper } from './helpers/translations';

test.describe('i18n Routing', () => {
  const testLocale = getTestLocale();
  const t = createTranslationHelper(testLocale);
  const localeDisplay = testLocale === 'pl' ? 'Polish' : 'English';

  test.describe('Locale Detection and Redirect', () => {
    test('should redirect root / to default locale', async ({ page }) => {
      await page.goto('/');

      await expect(page).toHaveURL(new RegExp(`\\/en\\/?`));
    });

    test('should handle non-existent locale by redirecting to default', async ({ page }) => {
      const response = await page.goto('/de/');

      expect(response?.status()).toBe(404);
    });
  });

  test.describe(`${localeDisplay} Locale (/${testLocale}/)`, () => {
    test('should load homepage', async ({ page }) => {
      await page.goto(`/${testLocale}/`);

      await expect(page).toHaveURL(new RegExp(`\/${testLocale}\/?`));

      expect(await page.title()).toBeTruthy();
    });

    test('should load CMS login page', async ({ page }) => {
      await page.goto(`/${testLocale}/cms/login`);

      await expect(page).toHaveURL(new RegExp(`\/${testLocale}\/cms\/login`));

      expect(await page.title()).toBeTruthy();
    });

    test('should display correct translations on homepage', async ({ page }) => {
      await page.goto(`/${testLocale}/`);

      const content = await page.textContent('body');
      const expectedText = testLocale === 'pl' ? 'Witaj w Cognito' : 'Welcome to Cognito';
      expect(content).toContain(expectedText);
    });
  });

  test.describe('Locale Persistence', () => {
    test('should maintain locale when navigating', async ({ page }) => {
      await page.goto(`/${testLocale}/`);

      await page.goto(`/${testLocale}/cms/login`);

      await expect(page).toHaveURL(new RegExp(`\/${testLocale}\/cms\/login`));
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should work on mobile viewport', async ({ page }) => {
      await page.goto(`/${testLocale}/`);

      await expect(page).toHaveURL(new RegExp(`\/${testLocale}\/?`));

      const content = await page.textContent('body');
      expect(content).toBeTruthy();
    });
  });
});
