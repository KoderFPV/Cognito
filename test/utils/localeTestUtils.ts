export const getTestLocale = (): string => {
  const locale = process.env.TEST_LOCALE;

  if (!locale) {
    throw new Error('TEST_LOCALE environment variable must be set to run tests');
  }

  return locale;
};
