import { useState, useEffect, useMemo } from "react";
import { Eye, ArrowClockwise, Copy } from "@phosphor-icons/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SandpackProvider, SandpackPreview, SandpackLayout, SandpackCodeEditor } from "@codesandbox/sandpack-react";
import { toast } from "sonner";

interface PreviewPanelProps {
  code: string;
}

export function PreviewPanel({ code }: PreviewPanelProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  // Parse the generated code to create a proper React component structure
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
}`,
        '/index.js': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);`
      };
    }

    // Try to extract component code and create a proper structure
    let componentCode = code;
    
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
    <div>
      ${componentCode}
    </div>
  );
}

export default GeneratedComponent;`;
      }
    }

    return {
      '/App.js': componentCode,
      '/index.js': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);`
    };
  }, [code, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    toast.success('Preview refreshed');
  };

  const handleCopyCode = async () => {
    if (code) {
      await navigator.clipboard.writeText(code);
      toast.success('Code copied to clipboard');
    }
  };

  const renderEmptyState = () => (
    <div className="flex items-center justify-center h-full text-muted-foreground">
      <div className="text-center space-y-3">
        <Eye size={48} className="mx-auto opacity-20" />
        <div className="text-sm">Live preview will appear here</div>
        <div className="text-xs opacity-75">Interactive component rendering with Sandpack</div>
      </div>
    </div>
  );

  return (
    <Card className="flex-1 flex flex-col">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base">Live Preview</CardTitle>
          {code && (
            <Badge variant="secondary" className="text-xs">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
              Live
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
            </>
          )}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Eye size={14} />
            Interactive
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-4">
        <div className="h-full min-h-[400px] bg-muted/10 rounded-lg overflow-hidden">
          {!code ? (
            renderEmptyState()
          ) : (
            <SandpackProvider
              key={refreshKey}
              template="react"
              files={sandpackFiles}
              theme="light"
              options={{
                autoReload: true,
                recompileMode: 'delayed',
                recompileDelay: 500,
                bundlerURL: undefined
              }}
              customSetup={{
                dependencies: {
                  'react': 'latest',
                  'react-dom': 'latest',
                  '@phosphor-icons/react': 'latest',
                  'framer-motion': 'latest',
                  'lucide-react': 'latest'
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
          )}
        </div>
      </CardContent>
    </Card>
  );
}