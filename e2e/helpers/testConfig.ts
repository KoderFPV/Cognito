export const getTestServerUrl = () => {
  const url = process.env.TEST_SERVER_URL;

  if (!url) {
    throw new Error('TEST_SERVER_URL environment variable is not set');
  }

  return url;
};

export const generateTestUserEmail = (prefix: string) => {
  return `test-${prefix}-${Date.now()}@example.com`;
};

export const TEST_USER_PASSWORD = 'TestPassword123';
