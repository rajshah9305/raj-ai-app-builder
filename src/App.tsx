import { AnimatedCalculator } from '@/components/AnimatedCalculator';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background flex items-center justify-center p-4">
      <AnimatedCalculator />
      <Toaster position="bottom-right" />
    </div>
  );
}

export default App;
