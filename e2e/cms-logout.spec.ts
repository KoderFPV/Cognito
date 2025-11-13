import { test, expect } from '@playwright/test';
import { setUserAsAdmin } from './helpers/testUser';
import {
  getTestServerUrl,
  generateTestUserEmail,
  TEST_USER_PASSWORD,
  getTestLocale,
} from './helpers/testConfig';
import { createTranslationHelper } from './helpers/translations';

test.describe('CMS Logout', () => {
  const testUserEmail = generateTestUserEmail('logout');
  const serverUrl = getTestServerUrl();
  const testLocale = getTestLocale();
  const t = createTranslationHelper(testLocale);
  const tCommon = t('common');

  test('should logout and redirect to home page when clicking logout button', async ({
    page,
  }) => {
    await page.goto(`${serverUrl}/${testLocale}/registration`);

    await page.fill('input[type="email"]', testUserEmail);
    await page.fill('input[name="password"]', TEST_USER_PASSWORD);
    await page.fill('input[name="confirmPassword"]', TEST_USER_PASSWORD);
    await page.check('input[type="checkbox"]');
    await page.click('button[type="submit"]');

    await page.waitForURL(`**/${testLocale}`);

    await setUserAsAdmin(testUserEmail);

    await page.goto(`${serverUrl}/${testLocale}/cms/login`);

    await page.fill('input[type="email"]', testUserEmail);
    await page.fill('input[type="password"]', TEST_USER_PASSWORD);
    await page.click('button[type="submit"]');

    await page.waitForURL(`**/${testLocale}/cms`);

    const avatar = page.locator(`button[title="${testUserEmail}"]`);
    await expect(avatar).toBeVisible();

    await avatar.click();

    const logoutButton = page.getByRole('button', { name: tCommon('logout') });
    await expect(logoutButton).toBeVisible();
    await logoutButton.click();

    await page.waitForURL(`**/${testLocale}`);

    await expect(page).toHaveURL(new RegExp(`\\/${testLocale}$`));

    await page.goto(`${serverUrl}/${testLocale}/cms`);

    await page.waitForURL(`**/${testLocale}/cms/login`);
    await expect(page).toHaveURL(new RegExp(`\\/${testLocale}\\/cms\\/login`));
  });
});
