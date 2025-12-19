import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { securityHeaders, validateRuntimeConfig } from '@/lib/config';

export function middleware(request: NextRequest) {
  // Validate configuration at runtime
  const configValidation = validateRuntimeConfig();
  if (!configValidation.isValid) {
    console.error('Configuration validation failed:', configValidation.errors);
    return NextResponse.json(
      { error: 'Service configuration error' },
      { status: 500 }
    );
  }

  const response = NextResponse.next();

  // Apply security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Add HSTS in production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
