import { Sparkle, Gear } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onOpenSettings: () => void;
  hasApiKey: boolean;
}

export function Header({ onOpenSettings, hasApiKey }: HeaderProps) {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-primary">
              <Sparkle size={28} weight="fill" />
              <h1 className="text-2xl font-bold">RAJ AI App Builder</h1>
            </div>
            <div className="hidden md:block text-sm text-muted-foreground">
              Enterprise-grade AI-powered React application generator
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-sm text-muted-foreground">
                Spark AI Ready
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={onOpenSettings}>
              <Gear size={16} />
              Settings
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}