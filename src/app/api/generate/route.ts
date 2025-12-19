import { NextRequest, NextResponse } from 'next/server';
import { orchestrateGeneration } from '@/lib/agents/orchestrator';
import { validateProjectId, validatePrompt, handleApiError, rateLimiter } from '@/lib/validation';
import { env } from '@/lib/config';
import { log } from '@/lib/logger';

export async function POST(request: NextRequest) {
  const startTime = performance.now();
  const clientIP = request.headers.get('x-forwarded-for') ||
                  request.headers.get('x-real-ip') ||
                  'unknown';

  try {
    log.info('Generate API request received', { clientIP });

    // Rate limiting using configured values
    const rateLimitKey = `generate:${clientIP}`;

    if (!rateLimiter.isAllowed(rateLimitKey, env.rateLimitRequests, env.rateLimitWindowMs)) {
      log.warn('Rate limit exceeded', { clientIP, rateLimitKey });
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.', success: false },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { projectId, prompt, models = ['llama-3.3-70b-versatile'] } = body;

    // Validate input
    const projectIdValidation = validateProjectId(projectId);
    if (!projectIdValidation.isValid) {
      return NextResponse.json(
        { error: projectIdValidation.errors.join(', '), success: false },
        { status: 400 }
      );
    }

    const promptValidation = validatePrompt(prompt);
    if (!promptValidation.isValid) {
      return NextResponse.json(
        { error: promptValidation.errors.join(', '), success: false },
        { status: 400 }
      );
    }

    const result = await orchestrateGeneration(projectId, prompt, models);

    const duration = performance.now() - startTime;
    log.api('POST', '/api/generate', 200, duration, {
      clientIP,
      projectId,
      promptLength: prompt.length,
      modelsCount: models.length,
      models: models,
      success: result.success,
      filesGenerated: result.files?.length || 0,
    });

    return NextResponse.json(result);
  } catch (error) {
    const duration = performance.now() - startTime;
    const { message, status } = handleApiError(error, 'generate API');

    log.api('POST', '/api/generate', status, duration, {
      clientIP,
      error: message,
      projectId: 'unknown', // We don't have access to parsed body in error case
    });

    return NextResponse.json(
      { error: message, success: false },
      { status }
    );
  }
}
