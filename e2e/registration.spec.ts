import { test, expect } from '@playwright/test';
import { getTestLocale } from './helpers/testConfig';
import { createTranslationHelper } from './helpers/translations';

test.describe('Registration Form', () => {
  const generateUniqueEmail = () => `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
  const testLocale = getTestLocale();
  const t = createTranslationHelper(testLocale);

  test.describe(`${testLocale === 'pl' ? 'Polish' : 'English'} Locale (/${testLocale}/registration)`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/${testLocale}/registration`);
    });

    test('should display registration form with all fields', async ({ page }) => {
      await expect(page).toHaveURL(new RegExp(`/${testLocale}/registration`));

      await expect(page.getByRole('heading', { name: t('registration')('title') })).toBeVisible();

      await expect(page.locator('#email')).toBeVisible();
      await expect(page.locator('#password')).toBeVisible();
      await expect(page.locator('#confirmPassword')).toBeVisible();
      await expect(page.getByRole('checkbox')).toBeVisible();

      await expect(page.getByRole('button', { name: t('registration')('submit') })).toBeVisible();
      await expect(page.getByRole('button', { name: t('registration')('cancel') })).toBeVisible();
    });

    test('should show validation error for invalid email', async ({ page }) => {
      await page.locator('#email').fill('invalidemail');
      await page.locator('#password').fill('Password123');
      await page.locator('#confirmPassword').fill('Password123');
      await page.getByRole('checkbox').check();

      await page.getByRole('button', { name: t('registration')('submit') }).click();

      await expect(page.getByText(t('registration')('validation.emailInvalid'))).toBeVisible();
    });

    test('should show validation error for password without uppercase', async ({ page }) => {
      await page.locator('#email').fill('test@example.com');
      await page.locator('#password').fill('password123');
      await page.locator('#confirmPassword').fill('password123');
      await page.getByRole('checkbox').check();

      await page.getByRole('button', { name: t('registration')('submit') }).click();

      await expect(page.getByText(t('registration')('validation.passwordUppercase'))).toBeVisible();
    });

    test('should show validation error for password without number', async ({ page }) => {
      await page.locator('#email').fill('test@example.com');
      await page.locator('#password').fill('PasswordABC');
      await page.locator('#confirmPassword').fill('PasswordABC');
      await page.getByRole('checkbox').check();

      await page.getByRole('button', { name: t('registration')('submit') }).click();

      await expect(page.getByText(t('registration')('validation.passwordNumber'))).toBeVisible();
    });

    test('should show validation error for short password', async ({ page }) => {
      await page.locator('#email').fill('test@example.com');
      await page.locator('#password').fill('Pass1');
      await page.locator('#confirmPassword').fill('Pass1');
      await page.getByRole('checkbox').check();

      await page.getByRole('button', { name: t('registration')('submit') }).click();

      await expect(page.getByText(t('registration')('validation.passwordMinLength'))).toBeVisible();
    });

    test('should show validation error for password mismatch', async ({ page }) => {
      await page.locator('#email').fill('test@example.com');
      await page.locator('#password').fill('Password123');
      await page.locator('#confirmPassword').fill('DifferentPassword123');
      await page.getByRole('checkbox').check();

      await page.getByRole('button', { name: t('registration')('submit') }).click();

      await expect(page.getByText(t('registration')('validation.passwordMismatch'))).toBeVisible();
    });

    test('should clear validation error when field is corrected', async ({ page }) => {
      await page.locator('#email').fill('invalidemail');
      await page.locator('#password').fill('Password123');
      await page.locator('#confirmPassword').fill('Password123');
      await page.getByRole('checkbox').check();

      await page.getByRole('button', { name: t('registration')('submit') }).click();

      await expect(page.getByText(t('registration')('validation.emailInvalid'))).toBeVisible();

      await page.locator('#email').fill('valid@example.com');

      await expect(page.getByText(t('registration')('validation.emailInvalid'))).not.toBeVisible();
    });

    test('should successfully register a new user', async ({ page }) => {
      const uniqueEmail = generateUniqueEmail();

      await page.locator('#email').fill(uniqueEmail);
      await page.locator('#password').fill('Password123');
      await page.locator('#confirmPassword').fill('Password123');
      await page.getByRole('checkbox').check();

      await page.getByRole('button', { name: t('registration')('submit') }).click();
    });

    test('should show error when registering with existing email', async ({ page }) => {
      const existingEmail = generateUniqueEmail();

      await page.locator('#email').fill(existingEmail);
      await page.locator('#password').fill('Password123');
      await page.locator('#confirmPassword').fill('Password123');
      await page.getByRole('checkbox').check();

      await page.getByRole('button', { name: t('registration')('submit') }).click();
      await page.waitForLoadState('networkidle');

      await page.goto(`/${testLocale}/registration`);

      await page.locator('#email').fill(existingEmail);
      await page.locator('#password').fill('Password123');
      await page.locator('#confirmPassword').fill('Password123');
      await page.getByRole('checkbox').check();

      await page.getByRole('button', { name: t('registration')('submit') }).click();
      await page.waitForLoadState('networkidle');

      await expect(page.getByText(t('registration')('errors.userExists'))).toBeVisible();
    });

  });

  test.describe('Mobile Responsiveness', () => {
    test('should work on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(`/${testLocale}/registration`);

      await expect(page.getByRole('heading', { name: t('registration')('title') })).toBeVisible();

      const uniqueEmail = generateUniqueEmail();

      await page.locator('#email').fill(uniqueEmail);
      await page.locator('#password').fill('Password123');
      await page.locator('#confirmPassword').fill('Password123');
      await page.getByRole('checkbox').check();

      await page.getByRole('button', { name: t('registration')('submit') }).click();
    });
  });

  test.describe('Form Interaction', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/${testLocale}/registration`);
    });

    test('should allow typing in all fields', async ({ page }) => {
      const emailInput = page.locator('#email');
      const passwordInput = page.locator('#password');
      const confirmPasswordInput = page.locator('#confirmPassword');

      await emailInput.fill('test@example.com');
      await expect(emailInput).toHaveValue('test@example.com');

      await passwordInput.fill('Password123');
      await expect(passwordInput).toHaveValue('Password123');

      await confirmPasswordInput.fill('Password123');
      await expect(confirmPasswordInput).toHaveValue('Password123');
    });

    test('should allow checking and unchecking terms checkbox', async ({ page }) => {
      const checkbox = page.getByRole('checkbox');

      await expect(checkbox).not.toBeChecked();

      await checkbox.check();
      await expect(checkbox).toBeChecked();

      await checkbox.uncheck();
      await expect(checkbox).not.toBeChecked();
    });
  });
});
