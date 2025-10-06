import { useState } from "react";
import { Play, Sparkle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

interface PromptInputProps {
  onGenerate: (prompt: string) => void;
  isGenerating: boolean;
  disabled: boolean;
}

export function PromptInput({ onGenerate, isGenerating, disabled }: PromptInputProps) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isGenerating && !disabled) {
      onGenerate(prompt.trim());
    }
  };

  const examplePrompts = [
    "Create a todo list app with add, delete, and toggle functionality",
    "Build a weather dashboard with location search and 5-day forecast",
    "Design a contact form with validation and success feedback",
    "Make a calculator app with basic arithmetic operations"
  ];

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <Sparkle size={20} weight="fill" />
          <h2 className="text-lg font-semibold">Describe Your App</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Textarea
              id="app-prompt"
              placeholder="Describe the React application you want to build. Be specific about features, styling, and functionality..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[120px] resize-none"
              disabled={isGenerating || disabled}
            />
            <div className="text-xs text-muted-foreground">
              Tip: Include details about UI components, data handling, and user interactions for best results
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={!prompt.trim() || isGenerating || disabled}
          >
            {isGenerating ? (
              <>
                <div className="animate-spin mr-2 w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
                Generating Application...
              </>
            ) : (
              <>
                <Play size={16} className="mr-2" />
                Generate React App
              </>
            )}
          </Button>
        </form>

        {!disabled && (
          <div className="space-y-3">
            <div className="text-sm font-medium text-muted-foreground">Example Prompts:</div>
            <div className="grid gap-2">
              {examplePrompts.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setPrompt(example)}
                  className="text-left text-sm p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  disabled={isGenerating}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}