import { useState, useEffect } from "react";
import { Eye, Bug, WarningCircle } from "@phosphor-icons/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PreviewPanelProps {
  code: string;
}

export function PreviewPanel({ code }: PreviewPanelProps) {
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (code) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
        try {
          setPreviewError(null);
        } catch (error) {
          setPreviewError("Failed to compile component");
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [code]);

  const renderPreview = () => {
    if (!code) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <div className="text-center space-y-3">
            <Eye size={48} className="mx-auto opacity-20" />
            <div className="text-sm">Live preview will appear here</div>
            <div className="text-xs opacity-75">Interactive component rendering with Sandpack</div>
          </div>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="text-sm text-muted-foreground">Compiling component...</div>
          </div>
        </div>
      );
    }

    if (previewError) {
      return (
        <div className="p-4">
          <Alert variant="destructive">
            <WarningCircle size={16} />
            <AlertDescription>{previewError}</AlertDescription>
          </Alert>
        </div>
      );
    }

    return (
      <div className="h-full bg-white rounded-lg border-2 border-dashed border-border/50 flex items-center justify-center">
        <div className="text-center space-y-3 text-muted-foreground">
          <div className="text-2xl opacity-40">🚧</div>
          <div className="text-sm">Live Preview</div>
          <div className="text-xs opacity-75">Sandpack integration coming soon</div>
          <Badge variant="secondary" className="text-xs">
            Component Ready
          </Badge>
        </div>
      </div>
    );
  };

  return (
    <Card className="flex-1 flex flex-col">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base">Live Preview</CardTitle>
          {code && !previewError && (
            <Badge variant="secondary" className="text-xs">
              <div className="w-2 h-2 bg-secondary rounded-full mr-1" />
              Ready
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Eye size={14} />
          Interactive
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-4">
        <div className="h-full min-h-[400px] bg-muted/10 rounded-lg overflow-hidden">
          {renderPreview()}
        </div>
      </CardContent>
    </Card>
  );
}