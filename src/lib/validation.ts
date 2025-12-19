export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Input validation utilities
export const validatePrompt = (prompt: string): ValidationResult => {
  const errors: string[] = [];

  if (!prompt || typeof prompt !== 'string') {
    errors.push('Prompt is required');
  } else {
    const trimmed = prompt.trim();
    if (trimmed.length === 0) {
      errors.push('Prompt cannot be empty');
    } else if (trimmed.length < 10) {
      errors.push('Prompt must be at least 10 characters long');
    } else if (trimmed.length > 2000) {
      errors.push('Prompt cannot exceed 2000 characters');
    }

    // Check for potentially harmful content
    const harmfulPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /eval\s*\(/i,
      /document\./i,
      /window\./i,
    ];

    if (harmfulPatterns.some(pattern => pattern.test(trimmed))) {
      errors.push('Prompt contains potentially unsafe content');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateProjectId = (projectId: string): ValidationResult => {
  const errors: string[] = [];

  if (!projectId || typeof projectId !== 'string') {
    errors.push('Project ID is required');
  } else if (!/^[a-zA-Z0-9_-]{8,}$/.test(projectId)) {
    errors.push('Invalid project ID format');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateFilePath = (path: string): ValidationResult => {
  const errors: string[] = [];

  if (!path || typeof path !== 'string') {
    errors.push('File path is required');
  } else {
    // Prevent directory traversal attacks
    if (path.includes('../') || path.includes('..\\') || path.startsWith('/')) {
      errors.push('Invalid file path');
    }

    // Allow only safe file extensions
    const allowedExtensions = ['.tsx', '.ts', '.js', '.jsx', '.json', '.css', '.scss'];
    const hasAllowedExtension = allowedExtensions.some(ext => path.endsWith(ext));
    if (!hasAllowedExtension) {
      errors.push('File type not allowed');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateCodeContent = (content: string): ValidationResult => {
  const errors: string[] = [];

  if (!content || typeof content !== 'string') {
    errors.push('Code content is required');
  } else if (content.length > 100000) { // 100KB limit
    errors.push('Code content is too large');
  }

  // Check for potentially dangerous patterns
  const dangerousPatterns = [
    /<script[^>]*>[\s\S]*?<\/script>/gi,
    /javascript:\s*[^"'\s]+/gi,
    /on\w+\s*=\s*["'][^"']*["']/gi,
    /eval\s*\(/gi,
    /Function\s*\(/gi,
    /setTimeout\s*\(\s*["'][^"']*["']/gi,
    /setInterval\s*\(\s*["'][^"']*["']/gi,
  ];

  if (dangerousPatterns.some(pattern => pattern.test(content))) {
    errors.push('Code contains potentially unsafe patterns');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// API error handling utilities
export const handleApiError = (error: unknown, context: string): { message: string; status: number } => {
  console.error(`API Error in ${context}:`, error);

  if (error instanceof ValidationError) {
    return { message: error.message, status: 400 };
  }

  if (error instanceof Error) {
    // Handle specific error types
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return { message: 'Network error occurred', status: 503 };
    }
    if (error.message.includes('timeout')) {
      return { message: 'Request timed out', status: 408 };
    }
    if (error.message.includes('rate limit')) {
      return { message: 'Too many requests', status: 429 };
    }

    return { message: error.message, status: 500 };
  }

  return { message: 'An unexpected error occurred', status: 500 };
};

// Environment validation
export const validateEnvironment = (): ValidationResult => {
  const errors: string[] = [];

  const requiredEnvVars = ['GROQ_API_KEYS'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    errors.push(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  // Validate GROQ API key format (basic check)
  if (process.env.GROQ_API_KEYS && !process.env.GROQ_API_KEYS.startsWith('gsk_')) {
    errors.push('Invalid GROQ API key format');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Rate limiting utilities (simple in-memory implementation)
class RateLimiter {
  private requests = new Map<string, number[]>();

  isAllowed(identifier: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;

    const userRequests = this.requests.get(identifier) || [];
    const recentRequests = userRequests.filter(time => time > windowStart);

    if (recentRequests.length >= maxRequests) {
      return false;
    }

    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);

    // Clean up old entries periodically
    if (Math.random() < 0.01) { // 1% chance to cleanup
      for (const [key, times] of this.requests.entries()) {
        const filtered = times.filter(time => time > windowStart);
        if (filtered.length === 0) {
          this.requests.delete(key);
        } else {
          this.requests.set(key, filtered);
        }
      }
    }

    return true;
  }
}

export const rateLimiter = new RateLimiter();
