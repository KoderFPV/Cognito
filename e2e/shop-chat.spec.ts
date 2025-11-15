import { test, expect } from '@playwright/test';
import { getTestLocale } from './helpers/testConfig';
import { createTranslationHelper } from './helpers/translations';

test.describe('Shop Chat Interface', () => {
  const testLocale = getTestLocale();
  const t = createTranslationHelper(testLocale);

  test.describe(`${testLocale === 'pl' ? 'Polish' : 'English'} Locale (/${testLocale}/shop/chat)`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/${testLocale}/shop/chat`);
    });

    test('should display chat interface with input and send button', async ({ page }) => {
      await expect(page).toHaveURL(new RegExp(`/${testLocale}/shop/chat`));

      const textarea = page.locator('textarea');
      await expect(textarea).toBeVisible();

      const sendButton = page.getByRole('button', { name: t('chat')('sendButton') });
      await expect(sendButton).toBeVisible();

      const placeholder = t('chat')('inputPlaceholder');
      await expect(textarea).toHaveAttribute('placeholder', placeholder);
    });

    test('should display empty state message when no messages', async ({ page }) => {
      const emptyStateText = t('chat')('emptyState');
      await expect(page.getByText(emptyStateText)).toBeVisible();
    });

    test('should allow typing in message input', async ({ page }) => {
      const textarea = page.locator('textarea');
      const testMessage = 'Hello, I am looking for a product';

      await textarea.fill(testMessage);
      await expect(textarea).toHaveValue(testMessage);
    });

    test('should send message on button click', async ({ page }) => {
      const textarea = page.locator('textarea');
      const sendButton = page.getByRole('button', { name: t('chat')('sendButton') });
      const testMessage = 'Tell me about your products';

      await textarea.fill(testMessage);
      await sendButton.click();

      const userMessage = page.getByText(testMessage);
      await expect(userMessage).toBeVisible();

      await expect(textarea).toHaveValue('');
    });

    test('should send message on Enter key press', async ({ page }) => {
      const textarea = page.locator('textarea');
      const testMessage = 'What is your best product?';

      await textarea.fill(testMessage);
      await textarea.press('Enter');

      const userMessage = page.getByText(testMessage);
      await expect(userMessage).toBeVisible();

      await expect(textarea).toHaveValue('');
    });

    test('should create new line on Shift+Enter', async ({ page }) => {
      const textarea = page.locator('textarea');

      await textarea.fill('First line');
      await textarea.press('Shift+Enter');

      const textWithNewline = 'First line\n';
      await expect(textarea).toHaveValue(textWithNewline);
    });

    test('should send multiple messages in sequence', async ({ page }) => {
      const textarea = page.locator('textarea');
      const sendButton = page.getByRole('button', { name: t('chat')('sendButton') });

      const message1 = 'First message';
      await textarea.fill(message1);
      await sendButton.click();
      await expect(page.getByText(message1)).toBeVisible();

      const message2 = 'Second message';
      await textarea.fill(message2);
      await sendButton.click();
      await expect(page.getByText(message2)).toBeVisible();

      const message3 = 'Third message';
      await textarea.fill(message3);
      await sendButton.click();
      await expect(page.getByText(message3)).toBeVisible();
    });

    test('should disable send button when input is empty', async ({ page }) => {
      const sendButton = page.getByRole('button', { name: t('chat')('sendButton') });
      const textarea = page.locator('textarea');

      await expect(sendButton).toBeDisabled();

      await textarea.fill('Some text');
      await expect(sendButton).not.toBeDisabled();

      await textarea.clear();
      await expect(sendButton).toBeDisabled();
    });

    test('should disable send button with only whitespace', async ({ page }) => {
      const sendButton = page.getByRole('button', { name: t('chat')('sendButton') });
      const textarea = page.locator('textarea');

      await textarea.fill('   ');
      await expect(sendButton).toBeDisabled();
    });

    test('should disable input and button during loading state', async ({ page }) => {
      const textarea = page.locator('textarea');
      const sendButton = page.getByRole('button', { name: t('chat')('sendButton') });
      const testMessage = 'Loading test';

      await textarea.fill(testMessage);

      await expect(textarea).toBeEnabled();
      await expect(sendButton).toBeEnabled();
    });

    test('should display messages with correct alignment', async ({ page }) => {
      const textarea = page.locator('textarea');
      const sendButton = page.getByRole('button', { name: t('chat')('sendButton') });
      const userMessage = 'My test message';

      await textarea.fill(userMessage);
      await sendButton.click();

      const messageBubble = page.getByText(userMessage);
      await expect(messageBubble).toBeVisible();

      const messageElement = messageBubble.locator('..');
      const classes = await messageElement.getAttribute('class');
      expect(classes).toContain('user');
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should work on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(`/${testLocale}/shop/chat`);

      const textarea = page.locator('textarea');
      const sendButton = page.getByRole('button', { name: t('chat')('sendButton') });

      await expect(textarea).toBeVisible();
      await expect(sendButton).toBeVisible();

      const testMessage = 'Mobile test message';
      await textarea.fill(testMessage);
      await sendButton.click();

      await expect(page.getByText(testMessage)).toBeVisible();
    });

    test('should have proper layout on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto(`/${testLocale}/shop/chat`);

      const textarea = page.locator('textarea');
      const sendButton = page.getByRole('button', { name: t('chat')('sendButton') });

      await expect(textarea).toBeVisible();
      await expect(sendButton).toBeVisible();
    });

    test('should have proper layout on desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto(`/${testLocale}/shop/chat`);

      const textarea = page.locator('textarea');
      const sendButton = page.getByRole('button', { name: t('chat')('sendButton') });

      await expect(textarea).toBeVisible();
      await expect(sendButton).toBeVisible();

      const testMessage = 'Desktop test message';
      await textarea.fill(testMessage);
      await sendButton.click();

      await expect(page.getByText(testMessage)).toBeVisible();
    });
  });

  test.describe('Form Interaction', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/${testLocale}/shop/chat`);
    });

    test('should focus textarea on mount', async ({ page }) => {
      const textarea = page.locator('textarea');
      await expect(textarea).toBeFocused();
    });

    test('should clear input after sending message', async ({ page }) => {
      const textarea = page.locator('textarea');
      const sendButton = page.getByRole('button', { name: t('chat')('sendButton') });

      await textarea.fill('Test message to clear');
      await sendButton.click();

      await expect(textarea).toHaveValue('');
    });

    test('should maintain message history', async ({ page }) => {
      const textarea = page.locator('textarea');
      const sendButton = page.getByRole('button', { name: t('chat')('sendButton') });

      const messages = ['Message 1', 'Message 2', 'Message 3'];

      for (const message of messages) {
        await textarea.fill(message);
        await sendButton.click();
        await expect(page.getByText(message)).toBeVisible();
      }

      for (const message of messages) {
        await expect(page.getByText(message)).toBeVisible();
      }
    });
  });
});
