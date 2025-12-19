import Groq from 'groq-sdk';
import { validateEnvironment } from './validation';
import { env } from './config';

export interface GroqOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stream?: boolean;
  stop?: string | string[] | null;
  tools?: Groq.Chat.Completions.ChatCompletionTool[];
}

export interface StreamChunk {
  content: string;
  finish_reason?: string | null;
}

export class GroqError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'GroqError';
  }
}

export class GroqClient {
  private groq: Groq | null = null;

  private initialize(): Groq {
    if (this.groq) return this.groq;

    this.groq = new Groq({
      apiKey: env.groqApiKey,
    });

    return this.groq;
  }

  async generateCode(prompt: string, options: GroqOptions = {}): Promise<string> {
    try {
      // Validate input
      if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
        throw new GroqError('Prompt is required and cannot be empty');
      }

      if (prompt.length > 10000) {
        throw new GroqError('Prompt is too long (max 10,000 characters)');
      }

      const groq = this.initialize();
      const completion = await groq.chat.completions.create({
        model: options.model || 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: Math.max(0, Math.min(2, options.temperature || 0.7)),
        max_tokens: Math.max(1, Math.min(32768, options.maxTokens || 8192)),
        top_p: Math.max(0, Math.min(1, options.topP || 1)),
        stream: false,
        stop: options.stop,
        tools: options.tools,
      });

      const result = completion.choices[0]?.message?.content;
      if (!result) {
        throw new GroqError('No response generated from Groq API');
      }

      return this.cleanCodeResponse(result);
    } catch (error) {
      if (error instanceof GroqError) {
        throw error;
      }

      // Handle Groq API errors
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as any).status;
        switch (status) {
          case 401:
            throw new GroqError('Invalid API key', 401);
          case 429:
            throw new GroqError('Rate limit exceeded', 429);
          case 500:
          case 502:
          case 503:
            throw new GroqError('Groq API service unavailable', status);
          default:
            throw new GroqError(`Groq API error: ${status}`, status);
        }
      }

      throw new GroqError(`Failed to generate code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async *generateCodeStream(prompt: string, options: GroqOptions = {}): AsyncGenerator<StreamChunk> {
    const groq = this.initialize();
    const completion = await groq.chat.completions.create({
      model: options.model || 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 8192,
      top_p: options.topP || 1,
      stream: true,
      stop: options.stop,
      tools: options.tools,
    });

    for await (const chunk of completion) {
      const content = chunk.choices[0]?.delta?.content || '';
      const finishReason = chunk.choices[0]?.finish_reason;

      yield {
        content,
        finish_reason: finishReason,
      };
    }
  }

  async generateJSON(prompt: string, options: GroqOptions = {}): Promise<any> {
    const jsonPrompt = `${prompt}\n\nReturn only valid JSON, no explanations.`;
    const result = await this.generateCode(jsonPrompt, options);

    try {
      return JSON.parse(result);
    } catch {
      return JSON.parse(this.extractJSON(result));
    }
  }

  private cleanCodeResponse(response: string): string {
    return response
      .replace(/^```(?:tsx?|javascript|jsx|json)?\s*\n/gm, '')
      .replace(/\n```\s*$/gm, '')
      .replace(/^\s*```\s*$/gm, '')
      .trim();
  }

  private extractJSON(text: string): string {
    const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('No valid JSON found in response');
    return jsonMatch[0];
  }

  // Convenience methods for different models
  async generateWithGPTOSS(prompt: string, options: Omit<GroqOptions, 'model'> = {}): Promise<string> {
    return this.generateCode(prompt, {
      ...options,
      model: 'openai/gpt-oss-120b',
      tools: [
        { type: 'function', function: { name: 'browser_search', description: 'Search the web', parameters: { type: 'object', properties: {} } } },
        { type: 'function', function: { name: 'code_interpreter', description: 'Execute code', parameters: { type: 'object', properties: {} } } }
      ] as Groq.Chat.Completions.ChatCompletionTool[],
    });
  }

  async generateWithLlama4Maverick(prompt: string, options: Omit<GroqOptions, 'model'> = {}): Promise<string> {
    return this.generateCode(prompt, {
      ...options,
      model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
      maxTokens: 8192,
    });
  }

  async generateWithLlama4Scout(prompt: string, options: Omit<GroqOptions, 'model'> = {}): Promise<string> {
    return this.generateCode(prompt, {
      ...options,
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      maxTokens: 8192,
    });
  }

  async generateWithKimiK2(prompt: string, options: Omit<GroqOptions, 'model'> = {}): Promise<string> {
    return this.generateCode(prompt, {
      ...options,
      model: 'moonshotai/kimi-k2-instruct-0905',
      temperature: 0.7,
      maxTokens: 16384,
    });
  }

  async generateWithLlama3370b(prompt: string, options: Omit<GroqOptions, 'model'> = {}): Promise<string> {
    return this.generateCode(prompt, {
      ...options,
      model: 'llama-3.3-70b-versatile',
      maxTokens: 32768,
    });
  }

  // Streaming convenience methods
  async *generateWithGPTOSSStream(prompt: string, options: Omit<GroqOptions, 'model'> = {}): AsyncGenerator<StreamChunk> {
    yield* this.generateCodeStream(prompt, {
      ...options,
      model: 'openai/gpt-oss-120b',
      tools: [
        { type: 'function', function: { name: 'browser_search', description: 'Search the web', parameters: { type: 'object', properties: {} } } }
      ] as Groq.Chat.Completions.ChatCompletionTool[],
    });
  }

  async *generateWithLlama4MaverickStream(prompt: string, options: Omit<GroqOptions, 'model'> = {}): AsyncGenerator<StreamChunk> {
    yield* this.generateCodeStream(prompt, {
      ...options,
      model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
      maxTokens: 8192,
    });
  }

  async *generateWithLlama4ScoutStream(prompt: string, options: Omit<GroqOptions, 'model'> = {}): AsyncGenerator<StreamChunk> {
    yield* this.generateCodeStream(prompt, {
      ...options,
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      maxTokens: 8192,
    });
  }

  async *generateWithKimiK2Stream(prompt: string, options: Omit<GroqOptions, 'model'> = {}): AsyncGenerator<StreamChunk> {
    yield* this.generateCodeStream(prompt, {
      ...options,
      model: 'moonshotai/kimi-k2-instruct-0905',
      temperature: 0.7,
      maxTokens: 16384,
    });
  }

  async *generateWithLlama3370bStream(prompt: string, options: Omit<GroqOptions, 'model'> = {}): AsyncGenerator<StreamChunk> {
    yield* this.generateCodeStream(prompt, {
      ...options,
      model: 'llama-3.3-70b-versatile',
      maxTokens: 32768,
    });
  }

  // Utility method to collect streaming response
  async generateStreamingAsString(prompt: string, options: GroqOptions = {}): Promise<string> {
    const chunks: string[] = [];
    for await (const chunk of this.generateCodeStream(prompt, options)) {
      chunks.push(chunk.content);
    }
    return chunks.join('');
  }
}

export const groqClient = new GroqClient();
