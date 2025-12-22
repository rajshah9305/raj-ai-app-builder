import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const agents = [
      {
        id: 'ui-agent',
        name: 'UI Agent',
        description: 'Generates React components and user interfaces',
        status: 'active'
      },
      {
        id: 'backend-agent', 
        name: 'Backend Agent',
        description: 'Creates API routes and server-side logic',
        status: 'active'
      },
      {
        id: 'database-agent',
        name: 'Database Agent', 
        description: 'Designs database schemas and data models',
        status: 'active'
      },
      {
        id: 'qa-agent',
        name: 'QA Agent',
        description: 'Validates and fixes generated code',
        status: 'active'
      }
    ];

    return NextResponse.json(agents);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}