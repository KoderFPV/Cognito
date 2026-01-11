type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const formatMessage = (level: LogLevel, category: string, message: string): string => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level.toUpperCase()}] [${category}] ${message}`;
};

const log = (level: LogLevel, category: string, message: string): void => {
  const formatted = formatMessage(level, category, message);

  switch (level) {
    case 'debug':
      console.debug(formatted);
      break;
    case 'info':
      console.info(formatted);
      break;
    case 'warn':
      console.warn(formatted);
      break;
    case 'error':
      console.error(formatted);
      break;
  }
};

export const graphLogger = {
  debug: (category: string, message: string): void => log('debug', category, message),
  info: (category: string, message: string): void => log('info', category, message),
  warn: (category: string, message: string): void => log('warn', category, message),
  error: (category: string, message: string): void => log('error', category, message),
};
