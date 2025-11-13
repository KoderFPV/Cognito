import enMessages from '../../messages/en.json';
import plMessages from '../../messages/pl.json';

export const createTranslationHelper = (locale: string) => {
  const messages = locale === 'pl' ? plMessages : enMessages;

  return (namespace: string) => (key: string) => {
    const namespaceMessages = (messages as Record<string, any>)[namespace] || {};
    const keys = key.split('.');
    let value: any = namespaceMessages;

    for (const k of keys) {
      value = value?.[k];
    }

    return value || key;
  };
};
