import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json() as { projectId?: string; path?: string; content?: string };
    const { projectId, path, content } = body;

    if (!projectId || !path || content === undefined) {
      return NextResponse.json({ error: 'Missing required fields: projectId, path, content' }, { status: 400 });
    }

    const file = await storage.files.update(projectId, path, content);

    return NextResponse.json(file);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json() as { projectId?: string; path?: string };
    const { projectId, path } = body;

    if (!projectId || !path) {
      return NextResponse.json({ error: 'Missing required fields: projectId, path' }, { status: 400 });
    }

    await storage.files.delete(projectId, path);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
