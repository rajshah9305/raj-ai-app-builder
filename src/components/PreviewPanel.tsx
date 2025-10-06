import { useState, useMemo } from "react";
import { Eye, ArrowClockwise, Copy, Warning } from "@phosphor-icons/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SandpackProvider, SandpackPreview, SandpackLayout } from "@codesandbox/sandpack-react";
import { toast } from "sonner";

interface PreviewPanelProps {
  code: string;
}

export function PreviewPanel({ code }: PreviewPanelProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  // Clean and parse the generated code to create a proper React component structure
  const sandpackFiles = useMemo(() => {
    if (!code.trim()) {
      return {
        '/App.js': `export default function App() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center', 
      justifyContent: 'center',
      height: '100vh',
      fontFamily: 'Inter, sans-serif',
      color: '#64748b'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>⚡</div>
        <div style={{ fontSize: '14px' }}>Generate a component to see live preview</div>
      </div>
    </div>
  );
}`
      };
    }

    // Clean the code by removing markdown code fences and extra formatting
    let componentCode = code
      .replace(/^```(tsx?|javascript|jsx?)?\s*\n/gm, '') // Remove opening code fences
      .replace(/\n```\s*$/gm, '') // Remove closing code fences
      .replace(/^\s*```\s*$/gm, '') // Remove standalone code fence lines
      .trim();
    
    // Basic validation and cleanup
    try {
      // If the code doesn't include export, add it
      if (!componentCode.includes('export')) {
        // Try to find function component pattern
        const functionMatch = componentCode.match(/function\s+(\w+)/);
        const arrowMatch = componentCode.match(/const\s+(\w+)\s*=/);
        
        if (functionMatch) {
          componentCode += `\n\nexport default ${functionMatch[1]};`;
        } else if (arrowMatch) {
          componentCode += `\n\nexport default ${arrowMatch[1]};`;
        } else {
          // Wrap in a default component
          componentCode = `function GeneratedComponent() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Inter, sans-serif' }}>
      ${componentCode}
    </div>
  );
}

export default GeneratedComponent;`;
        }
      }

      setHasError(false);
    } catch (error) {
      setHasError(true);
      componentCode = `export default function ErrorComponent() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: 'Inter, sans-serif',
      color: '#ef4444'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <div style={{ fontSize: '14px' }}>Error parsing component code</div>
      </div>
    </div>
  );
}`;
    }

    return {
      '/App.js': componentCode
    };
  }, [code, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    setHasError(false);
    toast.success('Preview refreshed');
  };

  const handleCopyCode = async () => {
    if (code) {
      await navigator.clipboard.writeText(code);
      toast.success('Code copied to clipboard');
    }
  };

  const handleUseFallback = () => {
    setUseFallback(true);
    toast.info('Switched to fallback preview mode');
  };

  const renderEmptyState = () => (
    <div className="flex items-center justify-center h-full text-muted-foreground">
      <div className="text-center space-y-3">
        <Eye size={48} className="mx-auto opacity-20" />
        <div className="text-sm">Live preview will appear here</div>
        <div className="text-xs opacity-75">Interactive component rendering</div>
      </div>
    </div>
  );

  const renderFallbackPreview = () => (
    <div className="p-6 text-center text-muted-foreground">
      <div className="space-y-4">
        <div className="text-4xl opacity-30">📝</div>
        <div className="text-sm">Code Preview</div>
        <div className="text-xs opacity-75">Interactive preview temporarily unavailable</div>
        <pre className="text-left bg-muted/20 p-4 rounded-lg text-xs overflow-auto max-h-64">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );

  const renderSandpackPreview = () => {
    try {
      return (
        <SandpackProvider
          key={refreshKey}
          template="react"
          files={sandpackFiles}
          theme="light"
          customSetup={{
            dependencies: {
              'react': '^18.0.0',
              'react-dom': '^18.0.0'
            }
          }}
        >
          <SandpackLayout>
            <SandpackPreview
              style={{ height: '400px' }}
              showOpenInCodeSandbox={false}
              showRefreshButton={false}
            />
          </SandpackLayout>
        </SandpackProvider>
      );
    } catch (error) {
      console.warn('Sandpack failed to load, falling back to static preview');
      return renderFallbackPreview();
    }
  };

  return (
    <Card className="flex-1 flex flex-col">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base">Live Preview</CardTitle>
          {code && (
            <Badge variant={hasError ? "destructive" : "secondary"} className="text-xs">
              <div className={`w-2 h-2 rounded-full mr-1 ${hasError ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`} />
              {hasError ? 'Error' : useFallback ? 'Static' : 'Live'}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {code && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyCode}
                className="h-7 px-2"
              >
                <Copy size={14} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                className="h-7 px-2"
              >
                <ArrowClockwise size={14} />
              </Button>
              {!useFallback && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleUseFallback}
                  className="h-7 px-2"
                  title="Switch to fallback mode"
                >
                  <Warning size={14} />
                </Button>
              )}
            </>
          )}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Eye size={14} />
            {useFallback ? 'Static' : 'Interactive'}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-4">
        {hasError && (
          <Alert className="mb-4">
            <Warning size={16} />
            <AlertDescription>
              There was an issue parsing the generated code. Try refreshing the preview or generating a new component.
            </AlertDescription>
          </Alert>
        )}
        <div className="h-full min-h-[400px] bg-muted/10 rounded-lg overflow-hidden">
          {!code ? (
            renderEmptyState()
          ) : useFallback ? (
            renderFallbackPreview()
          ) : (
            renderSandpackPreview()
          )}
        </div>
      </CardContent>
    </Card>
  );
}