import enMessages from '@/messages/en.json';
import plMessages from '@/messages/pl.json';

type NestedMessages = {
  [key: string]: string | NestedMessages;
};

const messages: Record<string, NestedMessages> = {
  en: enMessages as NestedMessages,
  pl: plMessages as NestedMessages,
};

const getNestedValue = (obj: NestedMessages, path: string): string | undefined => {
  const keys = path.split('.');
  let current: string | NestedMessages = obj;

  for (const key of keys) {
    if (typeof current !== 'object' || current === null) {
      return undefined;
    }
    current = current[key];
  }

  return typeof current === 'string' ? current : undefined;
};

export interface IAgentTranslator {
  (key: string, params?: Record<string, string | number>): string;
}

export const getAgentTranslations = (
  locale: string,
  namespace: string
): IAgentTranslator => {
  const localeMessages = messages[locale] || messages.en;

  return (key: string, params?: Record<string, string | number>): string => {
    const fullPath = `${namespace}.${key}`;
    let value = getNestedValue(localeMessages, fullPath);

    if (!value) {
      value = getNestedValue(messages.en, fullPath);
    }

    if (!value) {
      return key;
    }

    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        value = value!.replace(`{${paramKey}}`, String(paramValue));
      });
    }

    return value;
  };
};
