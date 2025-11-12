# E2E Tests Guidelines

## Timeouts

Always use Playwright's default timeout values instead of hardcoding custom timeouts in test code.

## Running Tests

### Default Locale (English)

```bash
npm run test:e2e
```

### With Specific Locale

E2E tests are configurable to run in different languages via the `TEST_LOCALE` environment variable.

**Run tests in English:**
```bash
TEST_LOCALE=en npm run test:e2e
```

**Run tests in Polish:**
```bash
TEST_LOCALE=pl npm run test:e2e
```

### Available Locales

- `en` - English (default)
- `pl` - Polish

### Configuration

The `TEST_LOCALE` environment variable is read from `.env.local` by default:

```
TEST_LOCALE=en
```

You can override it when running tests:

```bash
TEST_LOCALE=pl npm run test:e2e
```

## Translation Helper

E2E tests use a translation helper to fetch translated strings. The helper is located in `e2e/helpers/translations.ts` and provides a `createTranslationHelper` function:

```typescript
import { createTranslationHelper } from './helpers/translations';
import { getTestLocale } from './helpers/testConfig';

const testLocale = getTestLocale();
const t = createTranslationHelper(testLocale);

// Usage
const heading = t('registration')('title');
const email = t('registration')('email');
```

This approach ensures tests use actual translations instead of hardcoded strings, making them work correctly across all supported languages.
