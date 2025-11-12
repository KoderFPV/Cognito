const TEST_SERVER_URL = 'http://localhost:3000';

export const getTestServerUrl = (): string => {
  return TEST_SERVER_URL;
};

export const buildApiUrl = (locale: string, path: string): string => {
  return `${TEST_SERVER_URL}/${locale}${path}`;
};
