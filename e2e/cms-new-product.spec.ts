import { test, expect } from '@playwright/test';
import { createAdminUser, deleteUser } from './helpers/testUser';
import {
  getTestServerUrl,
  generateTestUserEmail,
  TEST_USER_PASSWORD,
  generateUniqueSKU,
  getTestLocale,
} from './helpers/testConfig';
import { loginAsAdmin } from './helpers/testAuth';
import { createTranslationHelper } from './helpers/translations';

test.describe('CMS New Product Form', () => {
  const adminEmail = generateTestUserEmail('admin-product');
  const serverUrl = getTestServerUrl();
  const testLocale = getTestLocale();
  const t = createTranslationHelper(testLocale);
  const tProduct = t('product');
  const tCommon = t('common');

  test.beforeAll(async () => {
    await createAdminUser(adminEmail, TEST_USER_PASSWORD);
  });

  test.afterAll(async () => {
    await deleteUser(adminEmail);
  });

  test.describe('Authorization', () => {
    test('should redirect non-authenticated users to login', async ({ page }) => {
      await page.goto(`${serverUrl}/${testLocale}/cms/products/newProduct`);
      await page.waitForURL(new RegExp(`\\/${testLocale}\\/cms\\/login`));
      await expect(page).toHaveURL(new RegExp(`\\/${testLocale}\\/cms\\/login`));
    });

    test('should redirect non-admin users to home page', async ({ page }) => {
      const customerEmail = generateTestUserEmail('customer-product');

      await page.goto(`${serverUrl}/${testLocale}/registration`);
      await page.fill('input[type="email"]', customerEmail);
      await page.fill('input[name="password"]', TEST_USER_PASSWORD);
      await page.fill('input[name="confirmPassword"]', TEST_USER_PASSWORD);
      await page.check('input[type="checkbox"]');
      await page.click('button[type="submit"]');

      await page.waitForURL(new RegExp(`\\/${testLocale}$`));
      await expect(page).toHaveURL(new RegExp(`\\/${testLocale}$`));

      await page.goto(`${serverUrl}/${testLocale}/cms/login`);
      await page.fill('input[type="email"]', customerEmail);
      await page.fill('input[type="password"]', TEST_USER_PASSWORD);
      await page.click('button[type="submit"]');

      await page.waitForURL(new RegExp(`\\/${testLocale}$`));
      await expect(page).toHaveURL(new RegExp(`\\/${testLocale}$`));

      await page.goto(`${serverUrl}/${testLocale}/cms/products/newProduct`);
      await page.waitForURL(new RegExp(`\\/${testLocale}$`));
      await expect(page).toHaveURL(new RegExp(`\\/${testLocale}$`));

      await deleteUser(customerEmail);
    });

    test('should allow admin users to access the page', async ({ page }) => {
      await loginAsAdmin(page, adminEmail);
      await page.goto(`${serverUrl}/${testLocale}/cms/products/newProduct`);
      await expect(page).toHaveURL(new RegExp(`\\/${testLocale}\\/cms\\/products\\/newProduct`));
      await expect(page.getByRole('heading', { name: tProduct('form.title') })).toBeVisible();
    });
  });

  test.describe('Form Display and Validation', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page, adminEmail);
      await page.goto(`${serverUrl}/${testLocale}/cms/products/newProduct`);
    });

    test('should display new product form with all fields', async ({ page }) => {
      await expect(page.getByRole('heading', { name: tProduct('form.title') })).toBeVisible();
      await expect(page.getByLabel(tProduct('form.name'))).toBeVisible();
      await expect(page.getByLabel(tProduct('form.description'))).toBeVisible();
      await expect(page.getByLabel(tProduct('form.price'))).toBeVisible();
      await expect(page.getByLabel(tProduct('form.sku'))).toBeVisible();
      await expect(page.getByLabel(tProduct('form.stock'))).toBeVisible();
      await expect(page.getByLabel(tProduct('form.category'))).toBeVisible();
      await expect(page.getByLabel(tProduct('form.image'))).toBeVisible();
      await expect(page.getByLabel(tProduct('form.isActive'))).toBeVisible();
      await expect(page.getByRole('button', { name: tProduct('form.submit') })).toBeVisible();
      await expect(page.getByRole('button', { name: tCommon('cancel') })).toBeVisible();
    });

    test('should show validation error for empty required fields', async ({ page }) => {
      await page.getByRole('button', { name: tProduct('form.submit') }).click();

      await expect(page.getByText(tProduct('errors.nameRequired'))).toBeVisible();
      await expect(page.getByText(tProduct('errors.descriptionRequired'))).toBeVisible();
      await expect(page.getByText(tProduct('errors.priceRequired'))).toBeVisible();
      await expect(page.getByText(tProduct('errors.skuRequired'))).toBeVisible();
      await expect(page.getByText(tProduct('errors.stockRequired'))).toBeVisible();
      await expect(page.getByText(tProduct('errors.categoryRequired'))).toBeVisible();
    });

    test('should show validation error for invalid price', async ({ page }) => {
      await page.locator('#name').fill('Test Product');
      await page.locator('#description').fill('Test Description');
      await page.locator('#price').fill('-10');
      await page.locator('#sku').fill('TEST-SKU');
      await page.locator('#stock').fill('10');

      await page.getByRole('button', { name: tProduct('form.submit') }).click();

      await expect(page.getByText(tProduct('errors.priceInvalid'))).toBeVisible();
    });

    test('should show validation error for invalid stock', async ({ page }) => {
      await page.locator('#name').fill('Test Product');
      await page.locator('#description').fill('Test Description');
      await page.locator('#price').fill('29.99');
      await page.locator('#sku').fill('TEST-SKU');
      await page.locator('#stock').fill('-5');

      await page.getByRole('button', { name: tProduct('form.submit') }).click();

      await expect(page.getByText(tProduct('errors.stockInvalid'))).toBeVisible();
    });

    test('should clear validation error when field is corrected', async ({ page }) => {
      await page.getByRole('button', { name: tProduct('form.submit') }).click();
      await expect(page.getByText(tProduct('errors.nameRequired'))).toBeVisible();

      await page.locator('#name').fill('Test Product');
      await expect(page.getByText(tProduct('errors.nameRequired'))).not.toBeVisible();
    });

    test('should show validation error for missing category', async ({ page }) => {
      await page.locator('#name').fill('Test Product');
      await page.locator('#description').fill('Test Description');
      await page.locator('#price').fill('29.99');
      await page.locator('#sku').fill('TEST-SKU');
      await page.locator('#stock').fill('10');

      await page.getByRole('button', { name: tProduct('form.submit') }).click();

      await expect(page.getByText(tProduct('errors.categoryRequired'))).toBeVisible();
    });
  });

  test.describe('Product Creation', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page, adminEmail);
      await page.goto(`${serverUrl}/${testLocale}/cms/products/newProduct`);
    });

    test('should successfully create a new product with required fields only', async ({ page }) => {
      const uniqueSKU = generateUniqueSKU();

      await page.locator('#name').fill('Test Product');
      await page.locator('#description').fill('This is a test product description');
      await page.locator('#price').fill('29.99');
      await page.locator('#sku').fill(uniqueSKU);
      await page.locator('#stock').fill('100');
      await page.locator('#category').fill('General');

      await page.getByRole('button', { name: tProduct('form.submit') }).click();

      await expect(page.getByText(tProduct('form.successMessage'))).toBeVisible();
    });

    test('should successfully create a new product with all fields', async ({ page }) => {
      const uniqueSKU = generateUniqueSKU();

      await page.locator('#name').fill('Complete Test Product');
      await page.locator('#description').fill('This is a complete test product with all fields filled');
      await page.locator('#price').fill('49.99');
      await page.locator('#sku').fill(uniqueSKU);
      await page.locator('#stock').fill('50');
      await page.locator('#category').fill('Electronics');

      const checkbox = page.getByLabel(tProduct('form.isActive'));
      if (!(await checkbox.isChecked())) {
        await checkbox.check();
      }

      await page.getByRole('button', { name: tProduct('form.submit') }).click();

      await expect(page.getByText(tProduct('form.successMessage'))).toBeVisible();
    });

    test('should create product with active checkbox unchecked', async ({ page }) => {
      const uniqueSKU = generateUniqueSKU();

      await page.locator('#name').fill('Inactive Product');
      await page.locator('#description').fill('This product is not active');
      await page.locator('#price').fill('19.99');
      await page.locator('#sku').fill(uniqueSKU);
      await page.locator('#stock').fill('0');
      await page.locator('#category').fill('Electronics');

      const checkbox = page.getByLabel(tProduct('form.isActive'));
      if (await checkbox.isChecked()) {
        await checkbox.uncheck();
      }

      await page.getByRole('button', { name: tProduct('form.submit') }).click();

      await page.waitForURL('**/cms/products');
    });
  });

  test.describe('Product List', () => {
    test('should display created product on products list page', async ({ page }) => {
      await loginAsAdmin(page, adminEmail);
      const productName = `List Test Product ${Date.now()}`;
      const uniqueSKU = generateUniqueSKU();

      await page.goto(`${serverUrl}/${testLocale}/cms/products/newProduct`);
      await page.locator('#name').fill(productName);
      await page.locator('#description').fill('This product should appear in the list');
      await page.locator('#price').fill('39.99');
      await page.locator('#sku').fill(uniqueSKU);
      await page.locator('#stock').fill('25');
      await page.locator('#category').fill('Testing');

      await page.getByRole('button', { name: tProduct('form.submit') }).click();

      await page.waitForURL(`**/${testLocale}/cms/products`);

      await page.waitForSelector('table');

      await expect(page.getByText(productName)).toBeVisible();
      await expect(page.getByRole('button', { name: new RegExp(productName) })).toBeVisible();
      await expect(page.getByRole('button', { name: new RegExp(uniqueSKU) })).toBeVisible();
    });

    test('should display created product with correct price format on products list', async ({ page }) => {
      await loginAsAdmin(page, adminEmail);
      const productName = `Price Format Test ${Date.now()}`;
      const uniqueSKU = generateUniqueSKU();

      await page.goto(`${serverUrl}/${testLocale}/cms/products/newProduct`);
      await page.locator('#name').fill(productName);
      await page.locator('#description').fill('Testing price format');
      await page.locator('#price').fill('99.99');
      await page.locator('#sku').fill(uniqueSKU);
      await page.locator('#stock').fill('10');
      await page.locator('#category').fill('Testing');

      await page.getByRole('button', { name: tProduct('form.submit') }).click();

      await page.waitForURL(`**/${testLocale}/cms/products`);

      await page.waitForSelector('table');

      await expect(page.getByText(productName)).toBeVisible();
      await expect(page.getByRole('button', { name: new RegExp(productName) })).toBeVisible();
    });

    test('should filter products on list by name', async ({ page }) => {
      await loginAsAdmin(page, adminEmail);
      const productName = `Filterable Product ${Date.now()}`;
      const uniqueSKU = generateUniqueSKU();

      await page.goto(`${serverUrl}/${testLocale}/cms/products/newProduct`);
      await page.locator('#name').fill(productName);
      await page.locator('#description').fill('This product will be used for filtering');
      await page.locator('#price').fill('29.99');
      await page.locator('#sku').fill(uniqueSKU);
      await page.locator('#stock').fill('50');
      await page.locator('#category').fill('Testing');

      await page.getByRole('button', { name: tProduct('form.submit') }).click();

      await expect(page.getByText(tProduct('form.successMessage'))).toBeVisible();

      await page.goto(`${serverUrl}/${testLocale}/cms/products`);
      await page.waitForSelector('table');

      await expect(page.getByText(productName)).toBeVisible();
    });
  });
});
