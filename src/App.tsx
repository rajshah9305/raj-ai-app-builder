import { useState } from 'react';
import { Header } from '@/components/Header';
import { PromptInput } from '@/components/PromptInput';
import { CodeEditor } from '@/components/CodeEditor';
import { PreviewPanel } from '@/components/PreviewPanel';
import { SettingsDialog } from '@/components/SettingsDialog';
import { Toaster } from '@/components/ui/sonner';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { PencilSimple } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';

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
  const [userPrompt, setUserPrompt] = useState('');
  const [showSplitView, setShowSplitView] = useState(false);

  const handleGenerate = async (prompt: string) => {
    setUserPrompt(prompt);
    setShowSplitView(true);
    setIsGenerating(true);
    setStreamingCode('');
    setGeneratedCode(null);

    try {
      const aiPrompt = window.spark.llmPrompt`Generate a complete React component based on this description: ${prompt}

Please create:
1. A functional React component with TypeScript
2. Proper imports and exports
3. Modern React patterns (hooks, functional components)
4. Inline styling with Tailwind CSS
5. Props interface if needed
6. JSDoc comments for documentation

Return only the component code, well-formatted and production-ready.`;

      const response = await window.spark.llm(aiPrompt, 'gpt-4o');
      
      const cleanedResponse = response
        .replace(/^```(tsx?|javascript|jsx?)?\s*\n/gm, '')
        .replace(/\n```\s*$/gm, '')
        .replace(/^\s*```\s*$/gm, '')
        .trim();
      
      for (let i = 0; i <= cleanedResponse.length; i++) {
        setStreamingCode(cleanedResponse.slice(0, i));
        await new Promise(resolve => setTimeout(resolve, 20));
      }

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

  const handleEditPrompt = () => {
    setShowSplitView(false);
    setGeneratedCode(null);
    setStreamingCode('');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onOpenSettings={() => setShowSettings(true)} 
        hasApiKey={true}
      />
      
      {!showSplitView ? (
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold tracking-tight">
                Build React Apps with AI
              </h2>
              <p className="text-lg text-muted-foreground">
                Describe your application in natural language and watch it come to life
              </p>
            </div>
            
            <PromptInput 
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              disabled={false}
            />
          </div>
        </main>
      ) : (
        <main className="flex h-[calc(100vh-73px)]">
          <div className="w-[350px] border-r border-border bg-muted/20 p-6 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Your Prompt
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEditPrompt}
                  className="h-7"
                >
                  <PencilSimple size={14} className="mr-1" />
                  Edit
                </Button>
              </div>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm leading-relaxed">{userPrompt}</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex-1 flex">
            <div className="flex-1 border-r border-border">
              <CodeEditor 
                code={streamingCode || generatedCode?.component || ''}
                isStreaming={isGenerating}
                onCodeChange={handleCodeChange}
              />
            </div>
            
            <div className="flex-1">
              <PreviewPanel 
                code={generatedCode?.component || ''}
              />
            </div>
          </div>
        </main>
      )}

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
