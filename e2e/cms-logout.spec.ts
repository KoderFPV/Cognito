import { test, expect } from '@playwright/test';
import { setUserAsAdmin } from './helpers/testUser';
import {
  getTestServerUrl,
  generateTestUserEmail,
  TEST_USER_PASSWORD,
} from './helpers/testConfig';

test.describe('CMS Logout', () => {
  const testUserEmail = generateTestUserEmail('logout');
  const serverUrl = getTestServerUrl();

  test('should logout and redirect to home page when clicking logout button', async ({
    page,
  }) => {
    await page.goto(`${serverUrl}/en/registration`);

    await page.fill('input[type="email"]', testUserEmail);
    await page.fill('input[name="password"]', TEST_USER_PASSWORD);
    await page.fill('input[name="confirmPassword"]', TEST_USER_PASSWORD);
    await page.check('input[type="checkbox"]');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/en', { timeout: 10000 });

    await setUserAsAdmin(testUserEmail);

    await page.goto(`${serverUrl}/en/cms/login`);

    await page.fill('input[type="email"]', testUserEmail);
    await page.fill('input[type="password"]', TEST_USER_PASSWORD);
    await page.click('button[type="submit"]');

    await page.waitForURL('**/en/cms', { timeout: 10000 });

    const avatar = page.locator(`button[title="${testUserEmail}"]`);
    await expect(avatar).toBeVisible();

    await avatar.click();

    const logoutButton = page.getByRole('button', { name: /logout/i });
    await expect(logoutButton).toBeVisible();
    await logoutButton.click();

    await page.waitForURL('**/en', { timeout: 10000 });

    await expect(page).toHaveURL(/\/en$/);

    await page.goto(`${serverUrl}/en/cms`);

    await page.waitForURL('**/en/cms/login', { timeout: 10000 });
    await expect(page).toHaveURL(/\/en\/cms\/login/);
  });
});
