import { useState } from "react";
import { ArrowRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

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
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          id="app-prompt"
          placeholder="Describe the React application you want to build..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[180px] resize-none text-base focus:ring-accent focus:border-accent"
          disabled={isGenerating || disabled}
        />
        
        <Button 
          type="submit" 
          size="lg"
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-medium" 
          disabled={!prompt.trim() || isGenerating || disabled}
        >
          {isGenerating ? (
            <>
              <div className="animate-spin mr-2 w-4 h-4 border-2 border-accent-foreground border-t-transparent rounded-full" />
              Generating Application...
            </>
          ) : (
            <>
              Generate App
              <ArrowRight size={18} className="ml-2" />
            </>
          )}
        </Button>
      </form>

      {!disabled && (
        <div className="space-y-3">
          <div className="text-sm font-medium text-muted-foreground">Try an example:</div>
          <div className="grid gap-2">
            {examplePrompts.map((example, index) => (
              <button
                key={index}
                onClick={() => setPrompt(example)}
                className="text-left text-sm p-3 rounded-md border border-border hover:border-accent hover:bg-accent/5 transition-all"
                disabled={isGenerating}
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}