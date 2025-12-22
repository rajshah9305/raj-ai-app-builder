import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { handleApiError, rateLimiter } from '@/lib/validation';
import { env } from '@/lib/config';
import { Project } from '@/types';

interface ProjectCreateData {
  name: string;
  description?: string;
}

const validateProjectData = (data: unknown): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data || typeof data !== 'object' || data === null) {
    errors.push('Project data is required and must be an object');
    return { isValid: false, errors };
  }

  const projectData = data as Partial<ProjectCreateData>;

  if (!projectData.name || typeof projectData.name !== 'string') {
    errors.push('Project name is required');
  } else if (projectData.name.trim().length === 0) {
    errors.push('Project name cannot be empty');
  } else if (projectData.name.length > 100) {
    errors.push('Project name cannot exceed 100 characters');
  }

  if (projectData.description !== undefined && projectData.description !== null) {
    if (typeof projectData.description !== 'string') {
      errors.push('Project description must be a string');
    } else if (projectData.description.length > 500) {
      errors.push('Project description cannot exceed 500 characters');
    }
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

    const validatedData = body as ProjectCreateData;
    const project = await storage.projects.create({
      name: validatedData.name.trim(),
      description: validatedData.description?.trim(),
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
