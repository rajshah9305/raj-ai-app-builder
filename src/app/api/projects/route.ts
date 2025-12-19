import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { handleApiError, rateLimiter } from '@/lib/validation';
import { env } from '@/lib/config';

const validateProjectData = (data: any) => {
  const errors: string[] = [];

  if (!data.name || typeof data.name !== 'string') {
    errors.push('Project name is required');
  } else if (data.name.trim().length === 0) {
    errors.push('Project name cannot be empty');
  } else if (data.name.length > 100) {
    errors.push('Project name cannot exceed 100 characters');
  }

  if (data.description && typeof data.description !== 'string') {
    errors.push('Project description must be a string');
  } else if (data.description && data.description.length > 500) {
    errors.push('Project description cannot exceed 500 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export async function POST(request: NextRequest) {
  try {
    // Rate limiting (50 requests per hour per IP)
    const clientIP = request.headers.get('x-forwarded-for') ||
                    request.headers.get('x-real-ip') ||
                    'unknown';
    const rateLimitKey = `projects:${clientIP}`;

    if (!rateLimiter.isAllowed(rateLimitKey, Math.floor(env.rateLimitRequests / 2), env.rateLimitWindowMs)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validation = validateProjectData(body);

    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.errors.join(', ') },
        { status: 400 }
      );
    }

    const project = await storage.projects.create({
      name: body.name.trim(),
      description: body.description?.trim(),
    });

    return NextResponse.json(project);
  } catch (error) {
    const { message, status } = handleApiError(error, 'projects POST API');
    return NextResponse.json({ error: message }, { status });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Rate limiting (200 requests per hour per IP)
    const clientIP = request.headers.get('x-forwarded-for') ||
                    request.headers.get('x-real-ip') ||
                    'unknown';
    const rateLimitKey = `projects-list:${clientIP}`;

    if (!rateLimiter.isAllowed(rateLimitKey, env.rateLimitRequests * 2, env.rateLimitWindowMs)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const projects = await storage.projects.list();
    return NextResponse.json(projects);
  } catch (error) {
    const { message, status } = handleApiError(error, 'projects GET API');
    return NextResponse.json({ error: message }, { status });
  }
}
