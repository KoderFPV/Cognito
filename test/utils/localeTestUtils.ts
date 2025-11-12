export const getTestLocale = (): string => {
  return process.env.TEST_LOCALE || 'en';
};
