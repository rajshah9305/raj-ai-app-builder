import { useState, useMemo, useEffect, useRef } from "react";
import { Eye, ArrowClockwise, Copy, Warning } from "@phosphor-icons/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

interface PreviewPanelProps {
  code: string;
}

export function PreviewPanel({ code }: PreviewPanelProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [hasError, setHasError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const previewHTML = useMemo(() => {
    if (!code.trim()) {
      return `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                margin: 0;
                padding: 0;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
                background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
              }
              .empty-state {
                text-align: center;
                color: #64748b;
              }
              .icon {
                font-size: 48px;
                margin-bottom: 16px;
                opacity: 0.3;
              }
              .text {
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="empty-state">
              <div class="icon">⚡</div>
              <div class="text">Generate a component to see live preview</div>
            </div>
          </body>
        </html>
      `;
    }

    let componentCode = code
      .replace(/^```(tsx?|javascript|jsx?)?\s*\n/gm, '')
      .replace(/\n```\s*$/gm, '')
      .replace(/^\s*```\s*$/gm, '')
      .trim();

    const cleanCode = componentCode
      .replace(/import\s+.*?from\s+['"]react['"];?/gi, '')
      .replace(/import\s+.*?from\s+['"].*?['"];?/gi, '')
      .replace(/export\s+default\s+/gi, '')
      .trim();

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
          <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
          <style>
            * {
              box-sizing: border-box;
            }
            body {
              margin: 0;
              padding: 20px;
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif;
              background: white;
            }
            #root {
              width: 100%;
            }
            .error-boundary {
              padding: 20px;
              background: #fee;
              border: 2px solid #fcc;
              border-radius: 8px;
              color: #c00;
              font-family: monospace;
              white-space: pre-wrap;
            }
          </style>
        </head>
        <body>
          <div id="root"></div>
          <script type="text/babel">
            const { useState, useEffect, useCallback, useMemo, useRef } = React;
            
            try {
              ${cleanCode}
              
              const componentName = ${cleanCode.match(/function\s+(\w+)/) ? `'${cleanCode.match(/function\s+(\w+)/)?.[1]}'` : 
                                      cleanCode.match(/const\s+(\w+)\s*=/) ? `'${cleanCode.match(/const\s+(\w+)\s*=/)?.[1]}'` : 
                                      "'GeneratedComponent'"};
              
              const App = eval(componentName);
              
              const root = ReactDOM.createRoot(document.getElementById('root'));
              root.render(<App />);
            } catch (error) {
              const root = ReactDOM.createRoot(document.getElementById('root'));
              root.render(
                <div className="error-boundary">
                  <strong>Preview Error:</strong>
                  <br/>
                  {error.toString()}
                </div>
              );
            }
          </script>
        </body>
      </html>
    `;
  }, [code, refreshKey]);

  useEffect(() => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(previewHTML);
        doc.close();
        setHasError(false);
      }
    }
  }, [previewHTML]);

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

  const renderEmptyState = () => (
    <div className="flex items-center justify-center h-full text-muted-foreground">
      <div className="text-center space-y-3">
        <Eye size={48} className="mx-auto opacity-20" />
        <div className="text-sm">Live preview will appear here</div>
        <div className="text-xs opacity-75">Interactive component rendering</div>
      </div>
    </div>
  );

  return (
    <Card className="flex-1 flex flex-col">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base">Live Preview</CardTitle>
          {code && (
            <Badge variant={hasError ? "destructive" : "secondary"} className="text-xs">
              <div className={`w-2 h-2 rounded-full mr-1 ${hasError ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`} />
              {hasError ? 'Error' : 'Live'}
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
        {hasError && (
          <Alert className="mb-4">
            <Warning size={16} />
            <AlertDescription>
              There was an issue parsing the generated code. Try refreshing the preview or generating a new component.
            </AlertDescription>
          </Alert>
        )}
        <div className="h-full min-h-[400px] bg-white rounded-lg overflow-hidden border border-border">
          {!code ? (
            renderEmptyState()
          ) : (
            <iframe
              ref={iframeRef}
              title="Component Preview"
              className="w-full h-full border-0"
              sandbox="allow-scripts"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}