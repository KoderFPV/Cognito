# Testing Guide

This document provides comprehensive information about testing in the Cognito project.

## Testing Stack

### Unit & Integration Tests
- **Vitest** - Fast, modern test runner with native ESM support
- **React Testing Library** - Component testing utilities
- **Happy DOM** - Lightweight DOM implementation

### E2E Tests
- **Playwright** - End-to-end testing framework
- **Devices**: Desktop Chrome, Mobile Chrome (Pixel 5)

## Running Tests

### Unit Tests

```bash
# Run all unit tests once
npm test

# Run tests in watch mode (recommended during development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

#### Unit Tests with Specific Locale

Unit tests can be configured to run in different languages via the `TEST_LOCALE` environment variable:

```bash
# Run tests in English (default)
TEST_LOCALE=en npm test

# Run tests in Polish
TEST_LOCALE=pl npm test

# Run tests in watch mode with Polish locale
TEST_LOCALE=pl npm run test:watch
```

### E2E Tests

**Important:** E2E tests require the Next.js dev server to be running.

```bash
# Run E2E tests (starts dev server automatically)
npm run test:e2e

# Run E2E tests with UI mode (interactive)
npm run test:e2e:ui

# Run E2E tests in headed mode (see browser)
npm run test:e2e:headed
```

#### E2E Tests with Specific Locale

E2E tests can be configured to run in different languages via the `TEST_LOCALE` environment variable:

```bash
# Run E2E tests in English (default)
TEST_LOCALE=en npm run test:e2e

# Run E2E tests in Polish
TEST_LOCALE=pl npm run test:e2e

# Run E2E tests in UI mode with Polish locale
TEST_LOCALE=pl npm run test:e2e:ui
```

### All Tests

```bash
# Run both unit and E2E tests
npm run test:all

# Run all tests with Polish locale
TEST_LOCALE=pl npm run test:all
```

## File Structure

```
cognito/
├── e2e/                           # E2E tests (Playwright)
│   ├── helpers/                   # E2E test helpers
│   │   ├── testConfig.ts          # Test configuration (server URL, passwords)
│   │   └── testUser.ts            # User management helpers (setUserAsAdmin)
│   └── *.spec.ts                  # E2E test files
├── test/                          # Test configuration
│   └── setup.ts                   # Vitest setup file
├── **/*.test.ts                   # Unit tests (Vitest)
├── playwright.config.ts           # Playwright configuration
└── vitest.config.ts               # Vitest configuration
```

## Writing Tests

### Unit Test Example (Vitest)

```typescript
// feature.test.ts
import { describe, it, expect } from 'vitest';

describe('Feature Name', () => {
  it('should do something', () => {
    expect(true).toBe(true);
  });
});
```

### Component Test Example

```typescript
// component.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### E2E Test Example (Playwright)

```typescript
// e2e/feature.spec.ts
import { test, expect } from '@playwright/test';
import { getTestServerUrl } from './helpers/testConfig';

test('should load page', async ({ page }) => {
  const serverUrl = getTestServerUrl();
  await page.goto(`${serverUrl}/en/`);
  await expect(page).toHaveURL(/\/en\/?/);
});
```

### E2E Test with Admin User

For tests that require admin access (e.g., CMS tests), use the `setUserAsAdmin` helper:

```typescript
// e2e/cms-feature.spec.ts
import { test, expect } from '@playwright/test';
import { setUserAsAdmin } from './helpers/testUser';
import {
  getTestServerUrl,
  generateTestUserEmail,
  TEST_USER_PASSWORD,
} from './helpers/testConfig';

test('should access CMS as admin', async ({ page }) => {
  const serverUrl = getTestServerUrl();
  const testUserEmail = generateTestUserEmail('cms-test');

  // Register new user
  await page.goto(`${serverUrl}/en/registration`);
  await page.fill('input[type="email"]', testUserEmail);
  await page.fill('input[name="password"]', TEST_USER_PASSWORD);
  await page.fill('input[name="confirmPassword"]', TEST_USER_PASSWORD);
  await page.check('input[type="checkbox"]');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/en');

  // Set user as admin in database
  await setUserAsAdmin(testUserEmail);

  // Login to CMS
  await page.goto(`${serverUrl}/en/cms/login`);
  await page.fill('input[type="email"]', testUserEmail);
  await page.fill('input[type="password"]', TEST_USER_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/en/cms');

  // Now test CMS functionality...
});
```

## Best Practices

### Unit Tests

- Place test files next to the code they test (e.g., `config.ts` → `config.test.ts`)
- Use descriptive test names that explain what is being tested
- Follow AAA pattern: Arrange, Act, Assert
- Keep tests isolated and independent

### E2E Tests

- Place all E2E tests in the `e2e/` directory
- Test user flows, not implementation details
- Use data-testid attributes for reliable selectors
- Test on both mobile and desktop viewports

### i18n Testing

```typescript
// Test locale routing
test('should redirect to default locale', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/en\/?/);
});

// Test translations display
test('should display correct translation', async ({ page }) => {
  await page.goto('/en/');
  const content = await page.textContent('body');
  expect(content).toContain('expected text');
});

// Test translation key parity
it('should have same translation keys in both locales', () => {
  const enKeys = Object.keys(enMessages);
  const plKeys = Object.keys(plMessages);
  expect(enKeys).toEqual(plKeys);
});
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm test -- --run

      - name: Run E2E tests
        run: npm run test:e2e
```

## Troubleshooting

### Vitest Issues

**Tests fail with "Cannot find module"**
```bash
rm -rf node_modules .next
npm install
```

**Update snapshots**
```bash
npm test -- -u
```

### Playwright Issues

**Tests timeout**
```bash
# Increase timeout
npm run test:e2e -- --timeout 60000
```

**Browser installation fails**
```bash
npx playwright install chromium
```

**View test report**
```bash
npx playwright show-report
```

## Configuration

### Environment Variables

Tests require the following environment variables to be set in `.env.local`:

```bash
# E2E Tests Configuration
TEST_SERVER_URL=http://localhost:2137

# Test Locale Configuration (optional, defaults to 'en')
TEST_LOCALE=en
```

**Variables explanation:**

- `TEST_SERVER_URL` - URL where the test server is running (used by E2E tests)
- `TEST_LOCALE` - Locale for test execution ('en' for English, 'pl' for Polish)

### Locale Configuration

Both unit and E2E tests respect the `TEST_LOCALE` environment variable:

- **Default locale**: English (`en`)
- **Available locales**: `en`, `pl`

The locale is used to:
- **Unit tests**: Control which translations are mocked/used
- **E2E tests**: Determine which locale paths to test (e.g., `/en/registration` vs `/pl/registration`)
- **Translation helpers**: Fetch correct language strings for assertions

**Set locale in `.env.local`:**
```bash
TEST_LOCALE=pl
```

**Override at runtime:**
```bash
TEST_LOCALE=pl npm test
TEST_LOCALE=pl npm run test:e2e
```

This approach ensures tests validate the application in different languages without code changes.

### Vitest Configuration (`vitest.config.ts`)

- **Environment**: `happy-dom` (lightweight DOM)
- **Setup file**: `test/setup.ts`
- **Coverage**: Configured with v8 provider
- **Excludes**: `node_modules`, `.next`, `e2e/`, `template/`

### Playwright Configuration (`playwright.config.ts`)

- **Test directory**: `e2e/`
- **Base URL**: `http://localhost:2137`
- **Browsers**: Desktop Chrome, Mobile Chrome (Pixel 5)
- **Auto-start**: Dev server starts automatically
- **Reporters**: HTML report

## E2E Test Helpers

### `testConfig.ts`

Provides test configuration and utilities:

- `getTestServerUrl()` - Returns test server URL from `TEST_SERVER_URL` env variable
- `getTestLocale()` - Returns test locale from `TEST_LOCALE` env variable (defaults to 'en')
- `generateTestUserEmail(prefix: string)` - Generates unique test user email
- `TEST_USER_PASSWORD` - Standard password for test users
- `generateUniqueSKU()` - Generates unique SKU for product tests

### `translations.ts`

Provides translation helper for E2E tests:

- `createTranslationHelper(locale: string)` - Creates a translation function for the specified locale
  - Returns a function that takes namespace and key and returns the translated string
  - Example: `t('registration')('title')` returns "Create Account" or "Załóż konto" depending on locale

**Usage:**
```typescript
import { createTranslationHelper } from './helpers/translations';
import { getTestLocale } from './helpers/testConfig';

const testLocale = getTestLocale();
const t = createTranslationHelper(testLocale);

const heading = t('registration')('title');
const email = t('registration')('email');
```

### `testUser.ts`

Provides user management helpers:

- `setUserAsAdmin(email: string)` - Sets existing user as admin in database

**Important**: `setUserAsAdmin` requires:
- MongoDB connection via `MONGODB_URI` environment variable
- User must already exist in the database
- Direct database access (bypasses application logic)

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [React Testing Library](https://testing-library.com/react)
- [next-intl Testing](https://next-intl-docs.vercel.app/docs/workflows/testing)
