import { groqClient } from '@/lib/groq-client';
import { storage } from '@/lib/storage';
import { AILog, ProjectFile } from '@/types';

const logs: AILog[] = [];

function addLog(agent: string, level: 'info' | 'warning' | 'error', message: string, context?: string) {
  const log: AILog = {
    id: Math.random().toString(36).substring(2, 11),
    agent,
    level,
    message,
    context,
    createdAt: new Date(),
  };
  logs.push(log);
  storage.logs.add(agent, level, message, context);
}

async function generateUICode(prompt: string, models: string[]): Promise<{ code: string; components: string[] }> {
  addLog('ui-agent', 'info', `Analyzing UI requirements using ${models.length} model(s)`);

  const uiPrompt = `Based on this app description: "${prompt}"
  
Generate a production-ready React page component. Return ONLY valid TypeScript/React code:

1. Use React hooks (useState, useEffect, useContext)
2. Use Tailwind CSS for styling
3. Include proper TypeScript types
4. Create a clean, modern UI with white background, black text, orange accents
5. Make it fully functional (not a mock)
6. Import from @/components for reusable components if needed
7. No placeholder text or comments

Return only the component code, starting with 'export default function' or 'function', wrapped in triple backticks.`;

  let code = '';
  let lastError = null;

  // Try each model until one succeeds
  for (const modelId of models) {
    try {
      addLog('ui-agent', 'info', `Attempting generation with model: ${modelId}`);
      
      if (modelId === 'openai/gpt-oss-120b') {
        code = await groqClient.generateWithGPTOSS(uiPrompt);
      } else if (modelId === 'meta-llama/llama-4-maverick-17b-128e-instruct') {
        code = await groqClient.generateWithLlama4Maverick(uiPrompt);
      } else if (modelId === 'meta-llama/llama-4-scout-17b-16e-instruct') {
        code = await groqClient.generateWithLlama4Scout(uiPrompt);
      } else if (modelId === 'moonshotai/kimi-k2-instruct-0905') {
        code = await groqClient.generateWithKimiK2(uiPrompt);
      } else {
        code = await groqClient.generateWithLlama3370b(uiPrompt);
      }
      
      if (code && code.trim()) {
        addLog('ui-agent', 'info', `Successfully generated UI code with model: ${modelId}`);
        break;
      }
    } catch (error) {
      lastError = error;
      addLog('ui-agent', 'warning', `Model ${modelId} failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      continue;
    }
  }

  if (!code || !code.trim()) {
    throw lastError || new Error('All models failed to generate UI code');
  }

  return {
    code,
    components: extractComponentNames(code),
  };
}

async function generateBackendAPI(prompt: string, schema: string, models: string[]): Promise<{ code: string; endpoints: string[] }> {
  addLog('backend-agent', 'info', `Generating API routes using ${models.length} model(s)`);

  const apiPrompt = `Based on this app description: "${prompt}" and database schema:
${schema}

Generate Next.js API route handlers. Return ONLY valid TypeScript code:

1. Create API routes for common operations (GET, POST, PUT, DELETE)
2. Include proper error handling and validation
3. Use standard HTTP status codes
4. Add CORS headers
5. Return JSON responses
6. No authentication needed (public APIs)

Return multiple routes as separate export functions. Wrap in triple backticks.`;

  let code = '';
  let lastError = null;

  // Try each model until one succeeds
  for (const modelId of models) {
    try {
      addLog('backend-agent', 'info', `Attempting generation with model: ${modelId}`);
      
      if (modelId === 'openai/gpt-oss-120b') {
        code = await groqClient.generateWithGPTOSS(apiPrompt);
      } else if (modelId === 'meta-llama/llama-4-maverick-17b-128e-instruct') {
        code = await groqClient.generateWithLlama4Maverick(apiPrompt);
      } else if (modelId === 'meta-llama/llama-4-scout-17b-16e-instruct') {
        code = await groqClient.generateWithLlama4Scout(apiPrompt);
      } else if (modelId === 'moonshotai/kimi-k2-instruct-0905') {
        code = await groqClient.generateWithKimiK2(apiPrompt);
      } else {
        code = await groqClient.generateWithLlama3370b(apiPrompt);
      }
      
      if (code && code.trim()) {
        addLog('backend-agent', 'info', `Successfully generated API code with model: ${modelId}`);
        break;
      }
    } catch (error) {
      lastError = error;
      addLog('backend-agent', 'warning', `Model ${modelId} failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      continue;
    }
  }

  if (!code || !code.trim()) {
    throw lastError || new Error('All models failed to generate API code');
  }

  return {
    code,
    endpoints: extractEndpoints(code),
  };
}

async function generateDatabaseSchema(prompt: string, models: string[]): Promise<string> {
  addLog('database-agent', 'info', `Analyzing data requirements using ${models.length} model(s)`);

  const schemaPrompt = `Based on this app description: "${prompt}"

Generate a TypeScript interface/type for the database schema. Include:
1. All necessary fields for the app
2. Proper TypeScript types
3. Optional fields marked as optional
4. Timestamps for created/updated dates

Return ONLY the TypeScript interfaces, no explanations. Wrap in triple backticks.`;

  let schema = '';
  let lastError = null;

  // Try each model until one succeeds
  for (const modelId of models) {
    try {
      addLog('database-agent', 'info', `Attempting generation with model: ${modelId}`);
      
      if (modelId === 'openai/gpt-oss-120b') {
        schema = await groqClient.generateWithGPTOSS(schemaPrompt);
      } else if (modelId === 'meta-llama/llama-4-maverick-17b-128e-instruct') {
        schema = await groqClient.generateWithLlama4Maverick(schemaPrompt);
      } else if (modelId === 'meta-llama/llama-4-scout-17b-16e-instruct') {
        schema = await groqClient.generateWithLlama4Scout(schemaPrompt);
      } else if (modelId === 'moonshotai/kimi-k2-instruct-0905') {
        schema = await groqClient.generateWithKimiK2(schemaPrompt);
      } else {
        schema = await groqClient.generateWithLlama3370b(schemaPrompt);
      }
      
      if (schema && schema.trim()) {
        addLog('database-agent', 'info', `Successfully generated schema with model: ${modelId}`);
        break;
      }
    } catch (error) {
      lastError = error;
      addLog('database-agent', 'warning', `Model ${modelId} failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      continue;
    }
  }

  if (!schema || !schema.trim()) {
    throw lastError || new Error('All models failed to generate database schema');
  }

  return schema;
}

async function validateAndFixCode(code: string, errors: string[]): Promise<string> {
  if (errors.length === 0) {
    addLog('qa-agent', 'info', 'Code validation passed');
    return code;
  }

  addLog('qa-agent', 'warning', `Found ${errors.length} issues to fix`);

  const fixPrompt = `Fix the following issues in this React code:

Errors found:
${errors.join('\n')}

Original code:
\`\`\`
${code}
\`\`\`

Return the corrected code. Ensure:
1. No placeholder text or comments
2. All imports are valid
3. No broken references
4. Production-ready code

Wrap the fixed code in triple backticks.`;

  const fixed = await groqClient.generateCode(fixPrompt);
  addLog('qa-agent', 'info', 'Code fixed successfully');

  return fixed;
}

export async function orchestrateGeneration(projectId: string, prompt: string, models: string[] = ['llama-3.3-70b-versatile']): Promise<{
  files: ProjectFile[];
  logs: AILog[];
  success: boolean;
  error?: string;
}> {
  try {
    logs.length = 0;
    addLog('orchestrator', 'info', 'Starting code generation', `Prompt: ${prompt}, Models: ${models.join(', ')}`);

    // Generate database schema
    const schema = await generateDatabaseSchema(prompt, models);

    // Generate UI code
    const { code: uiCode } = await generateUICode(prompt, models);

    // Generate API routes
    const { code: apiCode } = await generateBackendAPI(prompt, schema, models);

    // Validate UI code
    const uiErrors: string[] = validateCode(uiCode);
    const validatedUICode = await validateAndFixCode(uiCode, uiErrors);
    
    // Validate API code
    const apiErrors: string[] = validateCode(apiCode);
    const validatedApiCode = apiErrors.length > 0 ? await validateAndFixCode(apiCode, apiErrors) : apiCode;

    // Save files to storage
    const files: ProjectFile[] = [];

    const pageFile: ProjectFile = {
      id: Math.random().toString(36).substring(2, 11),
      projectId,
      path: 'src/app/page.tsx',
      content: validatedUICode,
      fileType: 'page',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    files.push(await storage.files.create(projectId, {
      path: pageFile.path,
      content: pageFile.content,
      fileType: pageFile.fileType,
    }));

    const apiFile: ProjectFile = {
      id: Math.random().toString(36).substring(2, 11),
      projectId,
      path: 'src/app/api/route.ts',
      content: validatedApiCode,
      fileType: 'api',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    files.push(await storage.files.create(projectId, {
      path: apiFile.path,
      content: apiFile.content,
      fileType: apiFile.fileType,
    }));

    const schemaFile: ProjectFile = {
      id: Math.random().toString(36).substring(2, 11),
      projectId,
      path: 'src/types/schema.ts',
      content: schema,
      fileType: 'schema',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    files.push(await storage.files.create(projectId, {
      path: schemaFile.path,
      content: schemaFile.content,
      fileType: schemaFile.fileType,
    }));

    // Save version snapshot
    await storage.versions.create(projectId, {
      versionNumber: 1,
      snapshot: JSON.stringify({
        files,
        generatedAt: new Date().toISOString(),
      }),
      description: `Initial generation from prompt: ${prompt}`,
    });

    addLog('orchestrator', 'info', 'Generation completed successfully', `Generated ${files.length} files`);

    return {
      files,
      logs,
      success: true,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    addLog('orchestrator', 'error', 'Generation failed', errorMessage);

    return {
      files: [],
      logs,
      success: false,
      error: errorMessage,
    };
  }
}

function validateCode(code: string): string[] {
  const errors: string[] = [];

  if (code.includes('TODO')) {
    errors.push('Code contains TODO comments');
  }
  if (code.includes('FIXME')) {
    errors.push('Code contains FIXME comments');
  }
  if (code.includes('// @ts-ignore')) {
    errors.push('Code contains type ignore directives');
  }
  if (code.match(/\/\/\s*placeholder|\/\/\s*stub|\/\/\s*mock/i)) {
    errors.push('Code contains placeholder text');
  }
  if (code.includes('undefined') && code.includes('=')) {
    const undefinedVars = code.match(/\w+\s*=\s*undefined/g);
    if (undefinedVars) {
      errors.push(`Found uninitialized variables: ${undefinedVars.join(', ')}`);
    }
  }

  return errors;
}

function extractComponentNames(code: string): string[] {
  const matches = code.match(/function\s+(\w+)|const\s+(\w+)\s*=\s*\(\)/g) || [];
  return matches.map(m => m.replace(/function\s+|const\s+|\s*=\s*\(\)/g, '')).filter(Boolean);
}

function extractEndpoints(code: string): string[] {
  const matches = code.match(/export\s+(async\s+)?function\s+(\w+)/g) || [];
  return matches.map(m => m.replace(/export\s+async\s+function\s+|export\s+function\s+/g, '')).filter(Boolean);
}
