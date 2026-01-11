import { useEffect, useRef } from "react";
import { Copy, Download } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
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
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">Generated Code</h3>
          {isStreaming && (
            <Badge variant="secondary" className="text-xs">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse mr-1" />
              Streaming
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleCopyCode}
            disabled={!code}
            className="h-8 w-8 p-0"
          >
            <Copy size={14} />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleDownloadCode}
            disabled={!code}
            className="h-8 w-8 p-0"
          >
            <Download size={14} />
          </Button>
        </div>
      </div>
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          className={`w-full h-full p-4 font-mono text-sm bg-muted/10 border-0 resize-none focus:outline-none ${
            isStreaming ? 'streaming-cursor' : ''
          }`}
          placeholder="Generated React component code will appear here..."
          spellCheck={false}
        />
        {!code && !isStreaming && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground pointer-events-none">
            <div className="text-center space-y-2">
              <div className="text-4xl opacity-20">{'</>'}</div>
              <div className="text-sm">Code will stream here in real-time</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}