import { NextRequest } from 'next/server';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Get minimum log level from environment variable, default to 'info'
const MIN_LOG_LEVEL = (process.env.LOG_LEVEL || 'info').toLowerCase() as LogLevel;
if (!LOG_LEVELS.hasOwnProperty(MIN_LOG_LEVEL)) {
  console.warn(`Invalid LOG_LEVEL environment variable: ${process.env.LOG_LEVEL}. Defaulting to 'info'`);
}
const MIN_LOG_LEVEL_VALUE = LOG_LEVELS[MIN_LOG_LEVEL] || LOG_LEVELS.info;

interface LogContext {
  userId?: string;
  action?: string;
  path?: string;
  method?: string;
  error?: Error;
  [key: string]: unknown;
}

function formatLog(level: LogLevel, message: string, context: LogContext = {}) {
  const timestamp = new Date().toISOString();
  const { error, ...safeContext } = context;

  // If there's an error, add error message and stack to context
  if (error) {
    safeContext.errorMessage = error.message;
    safeContext.errorStack = error.stack;
  }

  return JSON.stringify({
    timestamp,
    level,
    message,
    ...safeContext,
  });
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= MIN_LOG_LEVEL_VALUE;
}

function log(level: LogLevel, message: string, context: LogContext = {}) {
  if (!shouldLog(level)) {
    return;
  }

  const formattedLog = formatLog(level, message, context);
  
  switch (level) {
    case 'debug':
      console.debug(formattedLog);
      break;
    case 'info':
      console.info(formattedLog);
      break;
    case 'warn':
      console.warn(formattedLog);
      break;
    case 'error':
      console.error(formattedLog);
      break;
  }
}

export const logger = {
  debug: (message: string, context?: LogContext) => log('debug', message, context),
  info: (message: string, context?: LogContext) => log('info', message, context),
  warn: (message: string, context?: LogContext) => log('warn', message, context),
  error: (message: string, context?: LogContext) => log('error', message, context),
};

// Helper for API routes
export function getRequestContext(req: NextRequest) {
  return {
    path: req.nextUrl.pathname,
    method: req.method,
    userAgent: req.headers.get('user-agent'),
  };
}

// Helper for Server Components
export function getServerContext(userId?: string, action?: string) {
  return {
    userId,
    action,
    serverComponent: true,
  };
} 