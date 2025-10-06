import { useState, useEffect } from "react";
import { Key, CheckCircle, XCircle } from "@phosphor-icons/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

export function SettingsDialog({ open, onOpenChange, apiKey, onApiKeyChange }: SettingsDialogProps) {
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');

  useEffect(() => {
    setTempApiKey(apiKey);
    setValidationStatus(apiKey ? 'valid' : 'idle');
  }, [apiKey]);

  const validateApiKey = async (key: string) => {
    if (!key.trim()) {
      setValidationStatus('idle');
      return;
    }

    setIsValidating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (key.startsWith('csk-') && key.length > 20) {
        setValidationStatus('valid');
        toast.success("API key validated successfully!");
      } else {
        setValidationStatus('invalid');
        toast.error("Invalid API key format");
      }
    } catch (error) {
      setValidationStatus('invalid');
      toast.error("Failed to validate API key");
    } finally {
      setIsValidating(false);
    }
  };

  const handleSave = () => {
    if (validationStatus === 'valid') {
      onApiKeyChange(tempApiKey);
      onOpenChange(false);
      toast.success("Settings saved successfully!");
    }
  };

  const handleTestKey = () => {
    validateApiKey(tempApiKey);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key size={20} />
            API Configuration
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">Cerebras API Key</Label>
                <div className="relative">
                  <Input
                    id="api-key"
                    type="password"
                    placeholder="csk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    className="pr-12"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isValidating ? (
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : validationStatus === 'valid' ? (
                      <CheckCircle size={16} className="text-secondary" />
                    ) : validationStatus === 'invalid' ? (
                      <XCircle size={16} className="text-destructive" />
                    ) : null}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Get your API key from{" "}
                  <a 
                    href="https://cloud.cerebras.ai" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Cerebras Cloud
                  </a>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleTestKey}
                  disabled={!tempApiKey.trim() || isValidating}
                  className="flex-1"
                >
                  {isValidating ? "Testing..." : "Test Connection"}
                </Button>
                {validationStatus !== 'idle' && (
                  <Badge 
                    variant={validationStatus === 'valid' ? 'default' : 'destructive'}
                    className="px-3 py-1"
                  >
                    {validationStatus === 'valid' ? 'Valid' : 'Invalid'}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="bg-muted/30 p-4 rounded-lg space-y-2">
            <div className="text-sm font-medium">Model Configuration</div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>• Model: gpt-oss-120b</div>
              <div>• Max Tokens: 65,536</div>
              <div>• Streaming: Enabled</div>
              <div>• Temperature: 1.0</div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={validationStatus !== 'valid'}
            >
              Save Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}