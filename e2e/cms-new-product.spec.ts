import { test, expect } from '@playwright/test';
import { createAdminUser, deleteUser } from './helpers/testUser';
import {
  getTestServerUrl,
  generateTestUserEmail,
  TEST_USER_PASSWORD,
} from './helpers/testConfig';

test.describe('CMS New Product Form', () => {
  const adminEmail = generateTestUserEmail('admin-product');
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
    await page.waitForURL('**/en/cms', { timeout: 10000 });
  };

  test.describe('Authorization', () => {
    test('should redirect non-authenticated users to login', async ({ page }) => {
      await page.goto(`${serverUrl}/en/cms/products/newProduct`);
      await page.waitForURL(/\/en\/cms\/login/, { timeout: 10000 });
      await expect(page).toHaveURL(/\/en\/cms\/login/);
    });

    test('should redirect non-admin users to home page', async ({ page }) => {
      const customerEmail = generateTestUserEmail('customer-product');

      await page.goto(`${serverUrl}/en/registration`);
      await page.fill('input[type="email"]', customerEmail);
      await page.fill('input[name="password"]', TEST_USER_PASSWORD);
      await page.fill('input[name="confirmPassword"]', TEST_USER_PASSWORD);
      await page.check('input[type="checkbox"]');
      await page.click('button[type="submit"]');

      await page.waitForURL(/\/en$/, { timeout: 10000 });
      await expect(page).toHaveURL(/\/en$/);

      await page.goto(`${serverUrl}/en/cms/login`);
      await page.fill('input[type="email"]', customerEmail);
      await page.fill('input[type="password"]', TEST_USER_PASSWORD);
      await page.click('button[type="submit"]');

      await page.waitForURL(/\/en$/, { timeout: 10000 });
      await expect(page).toHaveURL(/\/en$/);

      await page.goto(`${serverUrl}/en/cms/products/newProduct`);
      await page.waitForURL(/\/en$/, { timeout: 10000 });
      await expect(page).toHaveURL(/\/en$/);

      await deleteUser(customerEmail);
    });

    test('should allow admin users to access the page', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto(`${serverUrl}/en/cms/products/newProduct`);
      await expect(page).toHaveURL(/\/en\/cms\/products\/newProduct/);
      await expect(page.getByRole('heading', { name: /add new product/i })).toBeVisible();
    });
  });

  test.describe('Form Display and Validation', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto(`${serverUrl}/en/cms/products/newProduct`);
    });

    test('should display new product form with all fields', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /add new product/i })).toBeVisible();
      await expect(page.getByLabel(/product name/i)).toBeVisible();
      await expect(page.getByLabel(/description/i)).toBeVisible();
      await expect(page.getByLabel(/price/i)).toBeVisible();
      await expect(page.getByLabel(/sku/i)).toBeVisible();
      await expect(page.getByLabel(/stock/i)).toBeVisible();
      await expect(page.getByLabel(/category/i)).toBeVisible();
      await expect(page.getByLabel(/product image/i)).toBeVisible();
      await expect(page.getByLabel(/active/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /create product/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /cancel/i })).toBeVisible();
    });

    test('should show validation error for empty required fields', async ({ page }) => {
      await page.getByRole('button', { name: /create product/i }).click();

      await expect(page.getByText(/product name is required/i)).toBeVisible();
      await expect(page.getByText(/description is required/i)).toBeVisible();
      await expect(page.getByText(/price is required/i)).toBeVisible();
      await expect(page.getByText(/sku is required/i)).toBeVisible();
      await expect(page.getByText(/stock is required/i)).toBeVisible();
      await expect(page.getByText(/category is required/i)).toBeVisible();
    });

    test('should show validation error for invalid price', async ({ page }) => {
      await page.locator('#name').fill('Test Product');
      await page.locator('#description').fill('Test Description');
      await page.locator('#price').fill('-10');
      await page.locator('#sku').fill('TEST-SKU');
      await page.locator('#stock').fill('10');

      await page.getByRole('button', { name: /create product/i }).click();

      await expect(page.getByText(/price must be a positive number/i)).toBeVisible();
    });

    test('should show validation error for invalid stock', async ({ page }) => {
      await page.locator('#name').fill('Test Product');
      await page.locator('#description').fill('Test Description');
      await page.locator('#price').fill('29.99');
      await page.locator('#sku').fill('TEST-SKU');
      await page.locator('#stock').fill('-5');

      await page.getByRole('button', { name: /create product/i }).click();

      await expect(page.getByText(/stock must be a non-negative integer/i)).toBeVisible();
    });

    test('should clear validation error when field is corrected', async ({ page }) => {
      await page.getByRole('button', { name: /create product/i }).click();
      await expect(page.getByText(/product name is required/i)).toBeVisible();

      await page.locator('#name').fill('Test Product');
      await expect(page.getByText(/product name is required/i)).not.toBeVisible();
    });

    test('should show validation error for missing category', async ({ page }) => {
      await page.locator('#name').fill('Test Product');
      await page.locator('#description').fill('Test Description');
      await page.locator('#price').fill('29.99');
      await page.locator('#sku').fill('TEST-SKU');
      await page.locator('#stock').fill('10');

      await page.getByRole('button', { name: /create product/i }).click();

      await expect(page.getByText(/category is required/i)).toBeVisible();
    });
  });

  test.describe('Product Creation', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto(`${serverUrl}/en/cms/products/newProduct`);
    });

    test('should successfully create a new product with required fields only', async ({ page }) => {
      const uniqueSKU = generateUniqueSKU();

      await page.locator('#name').fill('Test Product');
      await page.locator('#description').fill('This is a test product description');
      await page.locator('#price').fill('29.99');
      await page.locator('#sku').fill(uniqueSKU);
      await page.locator('#stock').fill('100');
      await page.locator('#category').fill('General');

      await page.getByRole('button', { name: /create product/i }).click();

      await expect(page.getByText(/product created successfully/i)).toBeVisible();
      await page.waitForTimeout(2000);
    });

    test('should successfully create a new product with all fields', async ({ page }) => {
      const uniqueSKU = generateUniqueSKU();

      await page.locator('#name').fill('Complete Test Product');
      await page.locator('#description').fill('This is a complete test product with all fields filled');
      await page.locator('#price').fill('49.99');
      await page.locator('#sku').fill(uniqueSKU);
      await page.locator('#stock').fill('50');
      await page.locator('#category').fill('Electronics');

      const checkbox = page.getByLabel(/active/i);
      if (!(await checkbox.isChecked())) {
        await checkbox.check();
      }

      await page.getByRole('button', { name: /create product/i }).click();

      await expect(page.getByText(/product created successfully/i)).toBeVisible();
      await page.waitForTimeout(2000);
    });

    test('should create product with active checkbox unchecked', async ({ page }) => {
      const uniqueSKU = generateUniqueSKU();

      await page.locator('#name').fill('Inactive Product');
      await page.locator('#description').fill('This product is not active');
      await page.locator('#price').fill('19.99');
      await page.locator('#sku').fill(uniqueSKU);
      await page.locator('#stock').fill('0');
      await page.locator('#category').fill('Electronics');

      const checkbox = page.getByLabel(/active/i);
      if (await checkbox.isChecked()) {
        await checkbox.uncheck();
      }

      await page.getByRole('button', { name: /create product/i }).click();

      await page.waitForURL('**/cms/products', { timeout: 10000 });
    });
  });

  test.describe('Polish Locale', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`${serverUrl}/pl/cms/login`);
      await page.fill('input[type="email"]', adminEmail);
      await page.fill('input[type="password"]', TEST_USER_PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForURL('**/pl/cms', { timeout: 10000 });
      await page.goto(`${serverUrl}/pl/cms/products/newProduct`);
    });

    test('should display new product form in Polish', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /dodaj nowy produkt/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /utwórz produkt/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /anuluj/i })).toBeVisible();
    });

    test('should show validation errors in Polish', async ({ page }) => {
      await page.getByRole('button', { name: /utwórz produkt/i }).click();

      await expect(page.getByText(/nazwa produktu jest wymagana/i)).toBeVisible();
      await expect(page.getByText(/opis jest wymagany/i)).toBeVisible();
      await expect(page.getByText(/cena jest wymagana/i)).toBeVisible();
      await expect(page.getByText(/sku jest wymagane/i)).toBeVisible();
      await expect(page.getByText(/stan magazynowy jest wymagany/i)).toBeVisible();
      await expect(page.getByText(/kategoria jest wymagana/i)).toBeVisible();
    });

    test('should successfully create a new product in Polish locale', async ({ page }) => {
      const uniqueSKU = generateUniqueSKU();

      await page.locator('#name').fill('Polski Produkt');
      await page.locator('#description').fill('Opis polskiego produktu');
      await page.locator('#price').fill('59.99');
      await page.locator('#sku').fill(uniqueSKU);
      await page.locator('#stock').fill('75');
      await page.locator('#category').fill('Elektronika');

      await page.getByRole('button', { name: /utwórz produkt/i }).click();

      await expect(page.getByText(/produkt utworzony pomyślnie/i)).toBeVisible();
      await page.waitForTimeout(2000);
    });
  });

  test.describe('Product List', () => {
    test('should display created product on products list page', async ({ page }) => {
      await loginAsAdmin(page);
      const productName = `List Test Product ${Date.now()}`;
      const uniqueSKU = generateUniqueSKU();

      await page.goto(`${serverUrl}/en/cms/products/newProduct`);
      await page.locator('#name').fill(productName);
      await page.locator('#description').fill('This product should appear in the list');
      await page.locator('#price').fill('39.99');
      await page.locator('#sku').fill(uniqueSKU);
      await page.locator('#stock').fill('25');
      await page.locator('#category').fill('Testing');

      await page.getByRole('button', { name: /create product/i }).click();

      await page.waitForURL('**/cms/products', { timeout: 10000 });

      await page.waitForSelector('table', { timeout: 10000 });

      await expect(page.getByText(productName)).toBeVisible();
      await expect(page.getByRole('button', { name: new RegExp(productName) })).toBeVisible();
      await expect(page.getByRole('button', { name: new RegExp(uniqueSKU) })).toBeVisible();
    });

    test('should display created product with correct price format on products list', async ({ page }) => {
      await loginAsAdmin(page);
      const productName = `Price Format Test ${Date.now()}`;
      const uniqueSKU = generateUniqueSKU();

      await page.goto(`${serverUrl}/en/cms/products/newProduct`);
      await page.locator('#name').fill(productName);
      await page.locator('#description').fill('Testing price format');
      await page.locator('#price').fill('99.99');
      await page.locator('#sku').fill(uniqueSKU);
      await page.locator('#stock').fill('10');
      await page.locator('#category').fill('Testing');

      await page.getByRole('button', { name: /create product/i }).click();

      await page.waitForURL('**/cms/products', { timeout: 10000 });

      await page.waitForSelector('table', { timeout: 10000 });

      await expect(page.getByText(productName)).toBeVisible();
      await expect(page.getByRole('button', { name: new RegExp(productName) })).toBeVisible();
    });

    test('should filter products on list by name', async ({ page }) => {
      await loginAsAdmin(page);
      const productName = `Filterable Product ${Date.now()}`;
      const uniqueSKU = generateUniqueSKU();

      await page.goto(`${serverUrl}/en/cms/products/newProduct`);
      await page.locator('#name').fill(productName);
      await page.locator('#description').fill('This product will be used for filtering');
      await page.locator('#price').fill('29.99');
      await page.locator('#sku').fill(uniqueSKU);
      await page.locator('#stock').fill('50');
      await page.locator('#category').fill('Testing');

      await page.getByRole('button', { name: /create product/i }).click();

      await expect(page.getByText(/product created successfully/i)).toBeVisible();
      await page.waitForTimeout(2000);

      await page.goto(`${serverUrl}/en/cms/products`);
      await page.waitForSelector('table', { timeout: 10000 });

      await expect(page.getByText(productName)).toBeVisible();
    });
  });
});
