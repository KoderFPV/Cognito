import { test, expect } from '@playwright/test';

test.describe('Registration Form', () => {
  const generateUniqueEmail = () => `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;

  test.describe('English Locale (/en/registration)', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/en/registration');
    });

    test('should display registration form with all fields', async ({ page }) => {
      await expect(page).toHaveURL(/\/en\/registration/);

      await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible();

      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/^password$/i)).toBeVisible();
      await expect(page.getByLabel(/confirm password/i)).toBeVisible();
      await expect(page.getByRole('checkbox')).toBeVisible();

      await expect(page.getByRole('button', { name: /register/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /cancel/i })).toBeVisible();
    });

    test('should show validation error for invalid email', async ({ page }) => {
      await page.getByLabel(/email/i).fill('invalidemail');
      await page.getByLabel(/^password$/i).fill('Password123');
      await page.getByLabel(/confirm password/i).fill('Password123');
      await page.getByRole('checkbox').check();

      await page.getByRole('button', { name: /register/i }).click();

      await expect(page.getByText(/invalid email format/i)).toBeVisible();
    });

    test('should show validation error for password without uppercase', async ({ page }) => {
      await page.getByLabel(/email/i).fill('test@example.com');
      await page.getByLabel(/^password$/i).fill('password123');
      await page.getByLabel(/confirm password/i).fill('password123');
      await page.getByRole('checkbox').check();

      await page.getByRole('button', { name: /register/i }).click();

      await expect(page.getByText(/uppercase/i)).toBeVisible();
    });

    test('should show validation error for password without number', async ({ page }) => {
      await page.getByLabel(/email/i).fill('test@example.com');
      await page.getByLabel(/^password$/i).fill('PasswordABC');
      await page.getByLabel(/confirm password/i).fill('PasswordABC');
      await page.getByRole('checkbox').check();

      await page.getByRole('button', { name: /register/i }).click();

      await expect(page.getByText(/number/i)).toBeVisible();
    });

    test('should show validation error for short password', async ({ page }) => {
      await page.getByLabel(/email/i).fill('test@example.com');
      await page.getByLabel(/^password$/i).fill('Pass1');
      await page.getByLabel(/confirm password/i).fill('Pass1');
      await page.getByRole('checkbox').check();

      await page.getByRole('button', { name: /register/i }).click();

      await expect(page.getByText(/8 character/i)).toBeVisible();
    });

    test('should show validation error for password mismatch', async ({ page }) => {
      await page.getByLabel(/email/i).fill('test@example.com');
      await page.getByLabel(/^password$/i).fill('Password123');
      await page.getByLabel(/confirm password/i).fill('DifferentPassword123');
      await page.getByRole('checkbox').check();

      await page.getByRole('button', { name: /register/i }).click();

      await expect(page.getByText(/do not match/i)).toBeVisible();
    });

    test('should clear validation error when field is corrected', async ({ page }) => {
      await page.getByLabel(/email/i).fill('invalidemail');
      await page.getByLabel(/^password$/i).fill('Password123');
      await page.getByLabel(/confirm password/i).fill('Password123');
      await page.getByRole('checkbox').check();

      await page.getByRole('button', { name: /register/i }).click();

      await expect(page.getByText(/invalid email format/i)).toBeVisible();

      await page.getByLabel(/email/i).fill('valid@example.com');

      await expect(page.getByText(/invalid email format/i)).not.toBeVisible();
    });

    test('should successfully register a new user', async ({ page }) => {
      const uniqueEmail = generateUniqueEmail();

      await page.getByLabel(/email/i).fill(uniqueEmail);
      await page.getByLabel(/^password$/i).fill('Password123');
      await page.getByLabel(/confirm password/i).fill('Password123');
      await page.getByRole('checkbox').check();

      await page.getByRole('button', { name: /register/i }).click();
    });

    test('should show error when registering with existing email', async ({ page }) => {
      const existingEmail = generateUniqueEmail();

      await page.getByLabel(/email/i).fill(existingEmail);
      await page.getByLabel(/^password$/i).fill('Password123');
      await page.getByLabel(/confirm password/i).fill('Password123');
      await page.getByRole('checkbox').check();

      await page.getByRole('button', { name: /register/i }).click();

      await page.goto('/en/registration');

      await page.getByLabel(/email/i).fill(existingEmail);
      await page.getByLabel(/^password$/i).fill('Password123');
      await page.getByLabel(/confirm password/i).fill('Password123');
      await page.getByRole('checkbox').check();

      await page.getByRole('button', { name: /register/i }).click();

      await expect(page.getByText(/user with this email already exists/i)).toBeVisible();
    });

  });

  test.describe('Polish Locale (/pl/registration)', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/pl/registration');
    });

    test('should display registration form in Polish', async ({ page }) => {
      await expect(page).toHaveURL(/\/pl\/registration/);

      await expect(page.getByRole('heading', { name: /zaB�| konto/i })).toBeVisible();

      await expect(page.getByRole('button', { name: /zarejestruj/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /anuluj/i })).toBeVisible();
    });

    test('should show validation errors in Polish', async ({ page }) => {
      await page.locator('#email').fill('invalidemail');
      await page.locator('#password').fill('Password123');
      await page.locator('#confirmPassword').fill('Password123');
      await page.getByRole('checkbox').check();

      await page.getByRole('button', { name: /zarejestruj/i }).click();

      await expect(page.getByText(/nieprawidłowy format adresu email/i)).toBeVisible();
    });

    test('should successfully register a new user in Polish locale', async ({ page }) => {
      const uniqueEmail = generateUniqueEmail();

      await page.locator('#email').fill(uniqueEmail);
      await page.locator('#password').fill('Password123');
      await page.locator('#confirmPassword').fill('Password123');
      await page.getByRole('checkbox').check();

      await page.getByRole('button', { name: /zarejestruj/i }).click();
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should work on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/en/registration');

      await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible();

      const uniqueEmail = generateUniqueEmail();

      await page.getByLabel(/email/i).fill(uniqueEmail);
      await page.getByLabel(/^password$/i).fill('Password123');
      await page.getByLabel(/confirm password/i).fill('Password123');
      await page.getByRole('checkbox').check();

      await page.getByRole('button', { name: /register/i }).click();
    });
  });

  test.describe('Form Interaction', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/en/registration');
    });

    test('should allow typing in all fields', async ({ page }) => {
      const emailInput = page.getByLabel(/email/i);
      const passwordInput = page.getByLabel(/^password$/i);
      const confirmPasswordInput = page.getByLabel(/confirm password/i);

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
