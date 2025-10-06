import { useState, useEffect } from "react";
import { Key, CheckCircle, Sparkle } from "@phosphor-icons/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkle size={20} />
            Application Settings
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-secondary" />
                  <span className="text-sm font-medium">Spark AI Integration</span>
                  <Badge variant="default" className="text-xs">
                    Active
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground pl-6">
                  Using built-in Spark AI API for component generation. No external API key required.
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-muted/30 p-4 rounded-lg space-y-2">
            <div className="text-sm font-medium">AI Configuration</div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>• Model: GPT-4o</div>
              <div>• Max Tokens: Auto</div>
              <div>• Streaming: Enabled</div>
              <div>• Context: React + TypeScript</div>
            </div>
          </div>

          <div className="bg-accent/10 p-4 rounded-lg space-y-2">
            <div className="text-sm font-medium text-accent">Features</div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>✓ Real-time component generation</div>
              <div>✓ Live preview with Sandpack</div>
              <div>✓ Modern React patterns</div>
              <div>✓ TypeScript support</div>
              <div>✓ Tailwind CSS styling</div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}