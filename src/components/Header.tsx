import { Sparkle, Gear } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onOpenSettings: () => void;
  hasApiKey: boolean;
}

export function Header({ onOpenSettings, hasApiKey }: HeaderProps) {
  return (
    <header className="border-b border-border bg-white">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkle size={28} weight="fill" className="text-accent" />
            <h1 className="text-xl font-bold tracking-tight">RAJ AI APP BUILDER</h1>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onOpenSettings}
            className="hover:bg-muted"
          >
            <Gear size={18} />
            Settings
          </Button>
        </div>
      </div>
    </header>
  );
}