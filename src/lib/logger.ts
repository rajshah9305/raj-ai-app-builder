import { env } from './config';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private readonly maxLogs = 1000; // Keep only last 1000 logs in memory

  private shouldLog(level: LogLevel): boolean {
    if (!env.enableDebugLogging && level === LogLevel.DEBUG) {
      return false;
    }
    return true;
  }

  private createLogEntry(level: LogLevel, message: string, context?: Record<string, any>): LogEntry {
    return {
      level,
      message,
      context,
      timestamp: new Date(),
      // In a real app, you'd get these from auth context
      // userId: getCurrentUserId(),
      // sessionId: getCurrentSessionId(),
    };
  }

  private writeLog(entry: LogEntry): void {
    // Add to in-memory store
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift(); // Remove oldest
    }

    // Console output (only in development or if debug logging is enabled)
    if (env.nodeEnv === 'development' || env.enableDebugLogging) {
      const prefix = `[${entry.timestamp.toISOString()}] ${entry.level.toUpperCase()}`;
      const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : '';

      switch (entry.level) {
        case LogLevel.ERROR:
          console.error(`${prefix}: ${entry.message}${contextStr}`);
          break;
        case LogLevel.WARN:
          console.warn(`${prefix}: ${entry.message}${contextStr}`);
          break;
        case LogLevel.INFO:
          console.info(`${prefix}: ${entry.message}${contextStr}`);
          break;
        case LogLevel.DEBUG:
          console.debug(`${prefix}: ${entry.message}${contextStr}`);
          break;
      }
    }

    // In production, you would send to a logging service like:
    // - Sentry for error tracking
    // - DataDog for comprehensive logging
    // - CloudWatch for AWS deployments
    // Example:
    // if (env.nodeEnv === 'production') {
    //   sendToLoggingService(entry);
    // }
  }

  debug(message: string, context?: Record<string, any>): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      this.writeLog(this.createLogEntry(LogLevel.DEBUG, message, context));
    }
  }

  info(message: string, context?: Record<string, any>): void {
    if (this.shouldLog(LogLevel.INFO)) {
      this.writeLog(this.createLogEntry(LogLevel.INFO, message, context));
    }
  }

  warn(message: string, context?: Record<string, any>): void {
    if (this.shouldLog(LogLevel.WARN)) {
      this.writeLog(this.createLogEntry(LogLevel.WARN, message, context));
    }
  }

  error(message: string, context?: Record<string, any>): void {
    this.writeLog(this.createLogEntry(LogLevel.ERROR, message, context));
  }

  // Get recent logs (useful for debugging)
  getRecentLogs(limit = 100): LogEntry[] {
    return this.logs.slice(-limit);
  }

  // Get logs by level
  getLogsByLevel(level: LogLevel, limit = 100): LogEntry[] {
    return this.logs.filter(log => log.level === level).slice(-limit);
  }

  // Clear logs
  clearLogs(): void {
    this.logs = [];
  }

  // Performance monitoring
  time(label: string): () => void {
    const start = performance.now();
    this.debug(`Starting timer: ${label}`);

    return () => {
      const duration = performance.now() - start;
      this.info(`Timer completed: ${label}`, { duration: `${duration.toFixed(2)}ms` });
    };
  }

  // API request logging
  logApiRequest(method: string, path: string, statusCode: number, duration: number, context?: Record<string, any>): void {
    const level = statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO;
    this.log(level, `API ${method} ${path} - ${statusCode}`, {
      method,
      path,
      statusCode,
      duration: `${duration.toFixed(2)}ms`,
      ...context,
    });
  }

  // User action logging
  logUserAction(action: string, context?: Record<string, any>): void {
    this.info(`User action: ${action}`, context);
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>): void {
    if (this.shouldLog(level)) {
      this.writeLog(this.createLogEntry(level, message, context));
    }
  }
}

// Global logger instance
export const logger = new Logger();

// Convenience functions
export const log = {
  debug: logger.debug.bind(logger),
  info: logger.info.bind(logger),
  warn: logger.warn.bind(logger),
  error: logger.error.bind(logger),
  time: logger.time.bind(logger),
  api: logger.logApiRequest.bind(logger),
  userAction: logger.logUserAction.bind(logger),
};
