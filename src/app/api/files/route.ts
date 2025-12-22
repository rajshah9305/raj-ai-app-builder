import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { projectId?: string; path?: string; content?: string; fileType?: string };
    const { projectId, path, content, fileType } = body;

    if (!projectId || !path || content === undefined || !fileType) {
      return NextResponse.json({ error: 'Missing required fields: projectId, path, content, fileType' }, { status: 400 });
    }

    const file = await storage.files.create(projectId, {
      path,
      content,
      fileType,
    });

    return NextResponse.json(file);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ error: 'Missing projectId' }, { status: 400 });
    }

    const files = await storage.files.list(projectId);

    return NextResponse.json(files);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
