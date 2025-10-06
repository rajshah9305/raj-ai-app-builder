import { useState } from 'react';
import { Header } from '@/components/Header';
import { PromptInput } from '@/components/PromptInput';
import { CodeEditor } from '@/components/CodeEditor';
import { PreviewPanel } from '@/components/PreviewPanel';
import { SettingsDialog } from '@/components/SettingsDialog';
import { Toaster } from '@/components/ui/sonner';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';

// Global spark API declaration
declare global {
  interface Window {
    spark: {
      llmPrompt: (strings: TemplateStringsArray, ...values: any[]) => string;
      llm: (prompt: string, modelName?: string, jsonMode?: boolean) => Promise<string>;
    };
  }
}

interface GeneratedCode {
  component: string;
  tests: string;
  docs: string;
}

function App() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode | null>(null);
  const [streamingCode, setStreamingCode] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useKV('cerebras_api_key', '');

  const handleGenerate = async (prompt: string) => {
    // No API key needed since we're using the built-in spark.llm API
    setIsGenerating(true);
    setStreamingCode('');
    setGeneratedCode(null);

    try {
      // Create the prompt for AI
      const aiPrompt = window.spark.llmPrompt`Generate a complete React component based on this description: ${prompt}

Please create:
1. A functional React component with TypeScript
2. Proper imports and exports
3. Modern React patterns (hooks, functional components)
4. Inline styling with Tailwind CSS
5. Props interface if needed
6. JSDoc comments for documentation

Return only the component code, well-formatted and production-ready.`;

      // Get the response
      const response = await window.spark.llm(aiPrompt, 'gpt-4o');
      
      // Clean the response by removing markdown code fences
      const cleanedResponse = response
        .replace(/^```(tsx?|javascript|jsx?)?\s*\n/gm, '') // Remove opening code fences
        .replace(/\n```\s*$/gm, '') // Remove closing code fences
        .replace(/^\s*```\s*$/gm, '') // Remove standalone code fence lines
        .trim();
      
      // Simulate streaming by revealing characters progressively
      for (let i = 0; i <= cleanedResponse.length; i++) {
        setStreamingCode(cleanedResponse.slice(0, i));
        await new Promise(resolve => setTimeout(resolve, 20));
      }

      // Generate tests and documentation
      const testPrompt = window.spark.llmPrompt`Generate comprehensive Jest/React Testing Library tests for this React component:

${cleanedResponse}

Include:
- Render tests
- User interaction tests
- Props validation tests
- Accessibility tests

Return only the test code.`;

      const tests = await window.spark.llm(testPrompt, 'gpt-4o');

      const docsPrompt = window.spark.llmPrompt`Generate clear documentation for this React component:

${cleanedResponse}

Include:
- Component description
- Props documentation
- Usage examples
- Any special notes

Format as markdown.`;

      const docs = await window.spark.llm(docsPrompt, 'gpt-4o');

      setGeneratedCode({
        component: cleanedResponse,
        tests,
        docs
      });

      toast.success('Component generated successfully!');

    } catch (error) {
      console.error('Generation failed:', error);
      toast.error('Failed to generate component. Please try again.');
    } finally {
      setIsGenerating(false);
      setStreamingCode('');
    }
  };

  const handleCodeChange = (newCode: string) => {
    if (generatedCode) {
      setGeneratedCode({
        ...generatedCode,
        component: newCode
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-background">
      <Header 
        onOpenSettings={() => setShowSettings(true)} 
        hasApiKey={true}
      />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        <PromptInput 
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          disabled={false}
        />

        <div className="grid lg:grid-cols-2 gap-8">
          <CodeEditor 
            code={streamingCode || generatedCode?.component || ''}
            isStreaming={isGenerating}
            onCodeChange={handleCodeChange}
          />
          
          <PreviewPanel 
            code={generatedCode?.component || ''}
          />
        </div>
      </main>

      <SettingsDialog 
        open={showSettings}
        onOpenChange={setShowSettings}
        apiKey={apiKey || ''}
        onApiKeyChange={(key: string) => setApiKey(key)}
      />

      <Toaster position="bottom-right" />
    </div>
  );
}

export default App;
