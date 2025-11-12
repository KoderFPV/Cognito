import { Page } from '@playwright/test';
import { getTestServerUrl, TEST_USER_PASSWORD, getTestLocale } from './testConfig';

export const loginAsAdmin = async (page: Page, adminEmail: string) => {
  const serverUrl = getTestServerUrl();
  const locale = getTestLocale();

  await page.goto(`${serverUrl}/${locale}/cms/login`);
  await page.fill('input[type="email"]', adminEmail);
  await page.fill('input[type="password"]', TEST_USER_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(`**/${locale}/cms`);
};
