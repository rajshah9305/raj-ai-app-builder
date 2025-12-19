import { validateEnvironment } from './validation';

// Environment configuration with validation
export interface AppConfig {
  groq: {
    apiKey: string;
  };
  app: {
    url: string;
    nodeEnv: 'development' | 'production' | 'test';
  };
  security: {
    rateLimitRequests: number;
    rateLimitWindowMs: number;
  };
}

// Cache for configuration to avoid repeated validation
let configCache: AppConfig | null = null;

export function getConfig(): AppConfig {
  if (configCache) {
    return configCache;
  }

  // Validate environment on first access
  const envValidation = validateEnvironment();
  if (!envValidation.isValid) {
    throw new Error(`Configuration validation failed: ${envValidation.errors.join(', ')}`);
  }

  configCache = {
    groq: {
      apiKey: process.env.GROQ_API_KEYS!,
    },
    app: {
      url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
      nodeEnv: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
    },
    security: {
      rateLimitRequests: parseInt(process.env.RATE_LIMIT_REQUESTS || '100', 10),
      rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '3600000', 10), // 1 hour
    },
  };

  return configCache;
}

// Safe environment variable access with defaults
export const env = {
  // Required environment variables (will throw if missing)
  get groqApiKey(): string {
    return getConfig().groq.apiKey;
  },

  // Optional environment variables with defaults
  get apiUrl(): string {
    return getConfig().app.url;
  },

  get nodeEnv(): 'development' | 'production' | 'test' {
    return getConfig().app.nodeEnv;
  },

  get rateLimitRequests(): number {
    return getConfig().security.rateLimitRequests;
  },

  get rateLimitWindowMs(): number {
    return getConfig().security.rateLimitWindowMs;
  },

  // Feature flags
  get enableAnalytics(): boolean {
    return process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true';
  },

  get enableDebugLogging(): boolean {
    return process.env.ENABLE_DEBUG_LOGGING === 'true' || this.nodeEnv === 'development';
  },
};

// Configuration validation for runtime
export function validateRuntimeConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  try {
    getConfig();
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Unknown configuration error');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Security headers configuration
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com https://unpkg.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://api.groq.com",
    "frame-src 'self'",
  ].join('; '),
};
