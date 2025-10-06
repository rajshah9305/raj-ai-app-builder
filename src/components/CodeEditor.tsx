import { useEffect, useRef } from "react";
import { Copy, Download } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface CodeEditorProps {
  code: string;
  isStreaming: boolean;
  onCodeChange: (code: string) => void;
}

export function CodeEditor({ code, isStreaming, onCodeChange }: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current && isStreaming) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  }, [code, isStreaming]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Code copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy code");
    }
  };

  const handleDownloadCode = () => {
    const blob = new Blob([code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated-component.tsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Code downloaded!");
  };

  return (
    <Card className="flex-1 flex flex-col">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base">Generated Code</CardTitle>
          {isStreaming && (
            <Badge variant="secondary" className="text-xs">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse mr-1" />
              Streaming
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCopyCode}
            disabled={!code}
          >
            <Copy size={14} />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDownloadCode}
            disabled={!code}
          >
            <Download size={14} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <div className="relative h-full">
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            className={`w-full h-full min-h-[400px] p-4 font-mono text-sm bg-muted/30 border-0 resize-none focus:outline-none focus:ring-2 focus:ring-ring rounded-none ${
              isStreaming ? 'streaming-cursor' : ''
            }`}
            placeholder="Generated React component code will appear here..."
            spellCheck={false}
          />
          {!code && !isStreaming && (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              <div className="text-center space-y-2">
                <div className="text-4xl opacity-20">{'</>'}</div>
                <div className="text-sm">Generated code will stream here in real-time</div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}