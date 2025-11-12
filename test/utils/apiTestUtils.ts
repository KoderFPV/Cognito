import { getTestLocale } from './localeTestUtils';

const TEST_SERVER_URL = 'http://localhost:3000';

export const getTestServerUrl = (): string => {
  return TEST_SERVER_URL;
};

export const buildApiUrl = (path: string): string => {
  const locale = getTestLocale();
  return `${TEST_SERVER_URL}/${locale}${path}`;
};
