import { test, expect } from '@playwright/test';
import { createAdminUser, deleteUser } from './helpers/testUser';
import {
  getTestServerUrl,
  generateTestUserEmail,
  TEST_USER_PASSWORD,
} from './helpers/testConfig';

test.describe('CMS Product Details View', () => {
  const adminEmail = generateTestUserEmail('admin-details');
  const serverUrl = getTestServerUrl();

  const generateUniqueSKU = () => `SKU-${Date.now()}-${Math.random().toString(36).substring(7)}`;

  test.beforeAll(async () => {
    await createAdminUser(adminEmail, TEST_USER_PASSWORD);
  });

  test.afterAll(async () => {
    await deleteUser(adminEmail);
  });

  const loginAsAdmin = async (page: any) => {
    await page.goto(`${serverUrl}/en/cms/login`);
    await page.fill('input[type="email"]', adminEmail);
    await page.fill('input[type="password"]', TEST_USER_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/en/cms');
  };

  const createTestProduct = async (page: any, productName: string, sku: string) => {
    await page.goto(`${serverUrl}/en/cms/products/newProduct`);
    await page.locator('#name').fill(productName);
    await page.locator('#description').fill('This is a test product for details view');
    await page.locator('#price').fill('99.99');
    await page.locator('#sku').fill(sku);
    await page.locator('#stock').fill('42');
    await page.locator('#category').fill('Test Category');

    await page.getByRole('button', { name: /create product/i }).click();
    await page.waitForURL('**/cms/products');
  };

  test.describe('Authorization', () => {
    test('should redirect non-authenticated users to login when accessing product details', async ({ page }) => {
      const fakeId = '507f1f77bcf86cd799439011';
      await page.goto(`${serverUrl}/en/cms/products/${fakeId}`);
      await page.waitForURL(/\/en\/cms\/login/);
      await expect(page).toHaveURL(/\/en\/cms\/login/);
    });

    test('should redirect non-admin users to home page when accessing product details', async ({ page }) => {
      const customerEmail = generateTestUserEmail('customer-details');
      const fakeId = '507f1f77bcf86cd799439011';

      await page.goto(`${serverUrl}/en/registration`);
      await page.fill('input[type="email"]', customerEmail);
      await page.fill('input[name="password"]', TEST_USER_PASSWORD);
      await page.fill('input[name="confirmPassword"]', TEST_USER_PASSWORD);
      await page.check('input[type="checkbox"]');
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/en$/);

      await page.goto(`${serverUrl}/en/cms/login`);
      await page.fill('input[type="email"]', customerEmail);
      await page.fill('input[type="password"]', TEST_USER_PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/en$/);

      await page.goto(`${serverUrl}/en/cms/products/${fakeId}`);
      await page.waitForURL(/\/en$/);
      await expect(page).toHaveURL(/\/en$/);

      await deleteUser(customerEmail);
    });

    test('should allow admin users to access product details page', async ({ page }) => {
      await loginAsAdmin(page);
      const productName = `Details Access Test ${Date.now()}`;
      const uniqueSKU = generateUniqueSKU();

      await createTestProduct(page, productName, uniqueSKU);

      const productRow = page.getByRole('button', { name: new RegExp(productName) }).first();
      await productRow.click();

      await page.waitForURL(/\/en\/cms\/products\/[a-f0-9]{24}/);
      await expect(page).toHaveURL(/\/en\/cms\/products\/[a-f0-9]{24}/);
    });
  });

  test.describe('Product Details Display', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page);
    });

    test('should display all product details fields correctly', async ({ page }) => {
      const productName = `Full Details Test ${Date.now()}`;
      const uniqueSKU = generateUniqueSKU();

      await createTestProduct(page, productName, uniqueSKU);

      const productRow = page.getByRole('button', { name: new RegExp(productName) }).first();
      await productRow.click();

      await page.waitForURL(/\/en\/cms\/products\/[a-f0-9]{24}/);

      await expect(page.getByText(productName)).toBeVisible();
      await expect(page.getByText('This is a test product for details view')).toBeVisible();
      await expect(page.getByText(/\$99\.99/)).toBeVisible();
      await expect(page.getByText(uniqueSKU)).toBeVisible();
      await expect(page.locator('text=/^42$/i')).toBeVisible();
      await expect(page.getByText('Test Category')).toBeVisible();
    });

    test('should display "Active" status for active products', async ({ page }) => {
      const productName = `Active Status Test ${Date.now()}`;
      const uniqueSKU = generateUniqueSKU();

      await page.goto(`${serverUrl}/en/cms/products/newProduct`);
      await page.locator('#name').fill(productName);
      await page.locator('#description').fill('Testing active status display');
      await page.locator('#price').fill('49.99');
      await page.locator('#sku').fill(uniqueSKU);
      await page.locator('#stock').fill('10');
      await page.locator('#category').fill('Test');

      const activeCheckbox = page.getByLabel(/active/i);
      if (!(await activeCheckbox.isChecked())) {
        await activeCheckbox.check();
      }

      await page.getByRole('button', { name: /create product/i }).click();
      await page.waitForURL('**/cms/products');

      const productRow = page.getByRole('button', { name: new RegExp(productName) }).first();
      await productRow.click();

      await page.waitForURL(/\/en\/cms\/products\/[a-f0-9]{24}/);

      await expect(page.locator('text=/^active$/i')).toBeVisible();
    });

    test('should display "Inactive" status for inactive products', async ({ page }) => {
      const productName = `Inactive Status Test ${Date.now()}`;
      const uniqueSKU = generateUniqueSKU();

      await page.goto(`${serverUrl}/en/cms/products/newProduct`);
      await page.locator('#name').fill(productName);
      await page.locator('#description').fill('Testing inactive status display');
      await page.locator('#price').fill('29.99');
      await page.locator('#sku').fill(uniqueSKU);
      await page.locator('#stock').fill('5');
      await page.locator('#category').fill('Test');

      const activeCheckbox = page.getByLabel(/active/i);
      if (await activeCheckbox.isChecked()) {
        await activeCheckbox.uncheck();
      }

      await page.getByRole('button', { name: /create product/i }).click();
      await page.waitForURL('**/cms/products');

      const productRow = page.getByRole('button', { name: new RegExp(productName) }).first();
      await productRow.click();

      await page.waitForURL(/\/en\/cms\/products\/[a-f0-9]{24}/);

      await expect(page.locator('text=/^inactive$/i')).toBeVisible();
    });

    test('should display created and updated timestamps with date and time', async ({ page }) => {
      const productName = `Timestamp Test ${Date.now()}`;
      const uniqueSKU = generateUniqueSKU();

      await createTestProduct(page, productName, uniqueSKU);

      const productRow = page.getByRole('button', { name: new RegExp(productName) }).first();
      await productRow.click();

      await page.waitForURL(/\/en\/cms\/products\/[a-f0-9]{24}/);

      const createdLabels = await page.getByText(/created/i).all();
      const updatedLabels = await page.getByText(/updated/i).all();

      await expect(createdLabels.length).toBeGreaterThan(0);
      await expect(updatedLabels.length).toBeGreaterThan(0);

      const pageContent = await page.content();
      expect(pageContent).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}.*\d{1,2}:\d{2}/);
    });

    test('should display price with correct currency format', async ({ page }) => {
      const productName = `Price Format Test ${Date.now()}`;
      const uniqueSKU = generateUniqueSKU();
      const testPrice = '149.99';

      await page.goto(`${serverUrl}/en/cms/products/newProduct`);
      await page.locator('#name').fill(productName);
      await page.locator('#description').fill('Price format testing');
      await page.locator('#price').fill(testPrice);
      await page.locator('#sku').fill(uniqueSKU);
      await page.locator('#stock').fill('20');
      await page.locator('#category').fill('Premium');

      await page.getByRole('button', { name: /create product/i }).click();
      await page.waitForURL('**/cms/products');

      const productRow = page.getByRole('button', { name: new RegExp(productName) }).first();
      await productRow.click();

      await page.waitForURL(/\/en\/cms\/products\/[a-f0-9]{24}/);

      await expect(page.getByText(/\$149\.99/)).toBeVisible();
    });
  });

  test.describe('Navigation', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page);
    });

    test('should navigate to product details when clicking on product row from list', async ({ page }) => {
      const productName = `Navigation Test ${Date.now()}`;
      const uniqueSKU = generateUniqueSKU();

      await createTestProduct(page, productName, uniqueSKU);

      const productRow = page.getByRole('button', { name: new RegExp(productName) }).first();
      await productRow.click();

      await page.waitForURL(/\/en\/cms\/products\/[a-f0-9]{24}/);

      await expect(page.getByText(productName)).toBeVisible();
    });

    test('should have back button that returns to products list', async ({ page }) => {
      const productName = `Back Button Test ${Date.now()}`;
      const uniqueSKU = generateUniqueSKU();

      await createTestProduct(page, productName, uniqueSKU);

      const productRow = page.getByRole('button', { name: new RegExp(productName) }).first();
      await productRow.click();

      await page.waitForURL(/\/en\/cms\/products\/[a-f0-9]{24}/);

      const backButton = page.getByRole('button', { name: /back/i });
      await backButton.click();

      await page.waitForURL('**/en/cms/products');
      await expect(page).toHaveURL(/\/en\/cms\/products$/);
    });
  });

  test.describe('Error Handling', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page);
    });

    test('should display error message for non-existent product ID', async ({ page }) => {
      const fakeId = '507f1f77bcf86cd799439011';
      await page.goto(`${serverUrl}/en/cms/products/${fakeId}`);

      await expect(page.getByText(/not found/i)).toBeVisible();
    });

    test('should display error message for invalid product ID format', async ({ page }) => {
      await page.goto(`${serverUrl}/en/cms/products/invalid-id`);

      await expect(page.getByText(/not found|failed/i)).toBeVisible();
    });

    test('should have back button visible even when error occurs', async ({ page }) => {
      const fakeId = '507f1f77bcf86cd799439011';
      await page.goto(`${serverUrl}/en/cms/products/${fakeId}`);

      const backButton = page.getByRole('button', { name: /back/i });
      await expect(backButton).toBeVisible();

      await backButton.click();
      await page.waitForURL('**/en/cms/products');
    });
  });
});
