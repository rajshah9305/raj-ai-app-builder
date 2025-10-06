import { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { Toaster } from '@/components/ui/sonner';
import { Header } from '@/components/Header';
import { PromptInput } from '@/components/PromptInput';
import { CodeEditor } from '@/components/CodeEditor';
import { PreviewPanel } from '@/components/PreviewPanel';
import { SettingsDialog } from '@/components/SettingsDialog';
import { useCerebrasStream } from '@/hooks/useCerebrasStream';
import { toast } from 'sonner';

function App() {
  const [apiKey, setApiKey] = useKV('cerebras-api-key', '');
  const [showSettings, setShowSettings] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  
  const { isStreaming, generatedCode: streamedCode, error, startGeneration } = useCerebrasStream();

  const handleGenerate = async (prompt: string) => {
    if (!apiKey) {
      toast.error('Please configure your Cerebras API key in settings');
      setShowSettings(true);
      return;
    }

    try {
      await startGeneration(prompt, apiKey);
    } catch (error) {
      toast.error('Failed to generate component');
    }
  };

  const handleCodeChange = (newCode: string) => {
    setGeneratedCode(newCode);
  };

  const currentCode = isStreaming ? streamedCode : generatedCode || streamedCode;

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onOpenSettings={() => setShowSettings(true)}
        hasApiKey={!!apiKey}
      />
      
      <div className="container mx-auto p-6 space-y-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <PromptInput
              onGenerate={handleGenerate}
              isGenerating={isStreaming}
              disabled={!apiKey}
            />
          </div>
          
          <div className="lg:col-span-2">
            <div className="grid md:grid-cols-2 gap-6 h-full">
              <CodeEditor
                code={currentCode}
                isStreaming={isStreaming}
                onCodeChange={handleCodeChange}
              />
              <PreviewPanel code={currentCode} />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <div className="text-destructive text-sm font-medium">Generation Error</div>
            <div className="text-destructive/80 text-sm mt-1">{error}</div>
          </div>
        )}
      </div>

      <SettingsDialog
        open={showSettings}
        onOpenChange={setShowSettings}
        apiKey={apiKey || ''}
        onApiKeyChange={setApiKey}
      />

      <Toaster position="bottom-right" />
    </div>
  );
}

export default App;