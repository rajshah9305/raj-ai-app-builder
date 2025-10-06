import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CalculatorState {
  display: string;
  previousValue: number | null;
  operation: string | null;
  waitingForOperand: boolean;
  isStreaming: boolean;
}

const initialState: CalculatorState = {
  display: '0',
  previousValue: null,
  operation: null,
  waitingForOperand: false,
  isStreaming: false,
};

export function AnimatedCalculator() {
  const [state, setState] = useState<CalculatorState>(initialState);
  const [streamingText, setStreamingText] = useState('');
  const [lastPressedButton, setLastPressedButton] = useState<string | null>(null);

  // Simulate streaming text effect for results
  const streamResult = useCallback(async (result: string) => {
    setState(prev => ({ ...prev, isStreaming: true }));
    setStreamingText('');
    
    for (let i = 0; i <= result.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 50));
      setStreamingText(result.slice(0, i));
    }
    
    setState(prev => ({ ...prev, display: result, isStreaming: false }));
    setStreamingText('');
  }, []);

  const calculate = useCallback((firstOperand: number, secondOperand: number, operation: string): number => {
    switch (operation) {
      case '+':
        return firstOperand + secondOperand;
      case '-':
        return firstOperand - secondOperand;
      case '×':
        return firstOperand * secondOperand;
      case '÷':
        if (secondOperand === 0) {
          toast.error('Cannot divide by zero');
          return firstOperand;
        }
        return firstOperand / secondOperand;
      default:
        return secondOperand;
    }
  }, []);

  const handleNumber = useCallback(async (num: string) => {
    setLastPressedButton(num);
    
    if (state.waitingForOperand) {
      setState(prev => ({
        ...prev,
        display: num,
        waitingForOperand: false,
      }));
    } else {
      const newDisplay = state.display === '0' ? num : state.display + num;
      await streamResult(newDisplay);
    }
  }, [state, streamResult]);

  const handleOperator = useCallback((nextOperator: string) => {
    setLastPressedButton(nextOperator);
    const inputValue = parseFloat(state.display);

    if (state.previousValue === null) {
      setState(prev => ({
        ...prev,
        previousValue: inputValue,
        operation: nextOperator,
        waitingForOperand: true,
      }));
    } else if (state.operation) {
      const currentValue = state.previousValue || 0;
      const newValue = calculate(currentValue, inputValue, state.operation);
      
      streamResult(String(newValue));
      setState(prev => ({
        ...prev,
        previousValue: newValue,
        operation: nextOperator,
        waitingForOperand: true,
      }));
    }
  }, [state, calculate, streamResult]);

  const handleEquals = useCallback(() => {
    setLastPressedButton('=');
    const inputValue = parseFloat(state.display);

    if (state.previousValue !== null && state.operation) {
      const newValue = calculate(state.previousValue, inputValue, state.operation);
      streamResult(String(newValue));
      setState(prev => ({
        ...prev,
        previousValue: null,
        operation: null,
        waitingForOperand: true,
      }));
    }
  }, [state, calculate, streamResult]);

  const handleClear = useCallback(() => {
    setLastPressedButton('C');
    setState(initialState);
    setStreamingText('');
  }, []);

  const handleDecimal = useCallback(() => {
    setLastPressedButton('.');
    if (state.waitingForOperand) {
      setState(prev => ({
        ...prev,
        display: '0.',
        waitingForOperand: false,
      }));
    } else if (state.display.indexOf('.') === -1) {
      setState(prev => ({
        ...prev,
        display: prev.display + '.',
      }));
    }
  }, [state]);

  // Clear last pressed button after animation
  useEffect(() => {
    if (lastPressedButton) {
      const timer = setTimeout(() => setLastPressedButton(null), 200);
      return () => clearTimeout(timer);
    }
  }, [lastPressedButton]);

  // Keyboard support
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const { key } = event;
      
      // Prevent default for calculator keys
      if ('0123456789+-*/.='.includes(key) || key === 'Enter' || key === 'Escape' || key === 'Backspace') {
        event.preventDefault();
      }

      if ('0123456789'.includes(key)) {
        handleNumber(key);
      } else if (key === '+') {
        handleOperator('+');
      } else if (key === '-') {
        handleOperator('-');
      } else if (key === '*') {
        handleOperator('×');
      } else if (key === '/') {
        handleOperator('÷');
      } else if (key === '.' || key === ',') {
        handleDecimal();
      } else if (key === '=' || key === 'Enter') {
        handleEquals();
      } else if (key === 'Escape' || key === 'c' || key === 'C') {
        handleClear();
      } else if (key === 'Backspace') {
        // Simple backspace functionality
        if (state.display.length > 1) {
          setState(prev => ({
            ...prev,
            display: prev.display.slice(0, -1)
          }));
        } else {
          setState(prev => ({
            ...prev,
            display: '0'
          }));
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleNumber, handleOperator, handleDecimal, handleEquals, handleClear, state]);

  const buttonVariants = {
    initial: { scale: 1 },
    pressed: { 
      scale: 0.95,
      transition: { duration: 0.1 }
    },
    hover: { 
      scale: 1.02,
      transition: { duration: 0.2 }
    }
  };

  const rippleVariants = {
    initial: { scale: 0, opacity: 0.6 },
    animate: { 
      scale: 4, 
      opacity: 0,
      transition: { duration: 0.6 }
    }
  };

  const CalculatorButton = ({ 
    children, 
    onClick, 
    className = "", 
    variant = "secondary",
    id 
  }: {
    children: React.ReactNode;
    onClick: () => void;
    className?: string;
    variant?: "secondary" | "destructive" | "default";
    id: string;
  }) => (
    <motion.div
      variants={buttonVariants}
      initial="initial"
      whileHover="hover"
      animate={lastPressedButton === id ? "pressed" : "initial"}
      className="relative overflow-hidden"
    >
      <Button
        onClick={onClick}
        variant={variant}
        size="lg"
        className={`w-full h-16 text-xl font-semibold relative ${className}`}
      >
        {children}
        <AnimatePresence>
          {lastPressedButton === id && (
            <motion.div
              variants={rippleVariants}
              initial="initial"
              animate="animate"
              exit="initial"
              className="absolute inset-0 bg-white/20 rounded-full"
            />
          )}
        </AnimatePresence>
      </Button>
    </motion.div>
  );

  const displayValue = state.isStreaming ? streamingText : state.display;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-sm mx-auto space-y-4"
    >
      <Card className="p-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-2xl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          {/* Display */}
          <div className="calculator-display rounded-lg p-4 min-h-[80px] flex items-center justify-end border border-border/20">
            <motion.div
              key={displayValue}
              initial={{ opacity: 0.8, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className={`text-right font-mono text-3xl font-bold text-foreground ${
                state.isStreaming ? 'streaming-cursor' : ''
              }`}
            >
              {displayValue}
            </motion.div>
          </div>
          
          {/* Operation indicator */}
          <AnimatePresence>
            {state.operation && state.previousValue !== null && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-right text-sm text-muted-foreground mt-2"
              >
                {state.previousValue} {state.operation}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Button Grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="grid grid-cols-4 gap-2"
        >
          {/* Row 1 */}
          <CalculatorButton
            id="C"
            onClick={handleClear}
            variant="destructive"
            className="col-span-2"
          >
            Clear
          </CalculatorButton>
          <CalculatorButton
            id="÷"
            onClick={() => handleOperator('÷')}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            ÷
          </CalculatorButton>
          <CalculatorButton
            id="×"
            onClick={() => handleOperator('×')}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            ×
          </CalculatorButton>

          {/* Row 2 */}
          <CalculatorButton id="7" onClick={() => handleNumber('7')}>
            7
          </CalculatorButton>
          <CalculatorButton id="8" onClick={() => handleNumber('8')}>
            8
          </CalculatorButton>
          <CalculatorButton id="9" onClick={() => handleNumber('9')}>
            9
          </CalculatorButton>
          <CalculatorButton
            id="-"
            onClick={() => handleOperator('-')}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            -
          </CalculatorButton>

          {/* Row 3 */}
          <CalculatorButton id="4" onClick={() => handleNumber('4')}>
            4
          </CalculatorButton>
          <CalculatorButton id="5" onClick={() => handleNumber('5')}>
            5
          </CalculatorButton>
          <CalculatorButton id="6" onClick={() => handleNumber('6')}>
            6
          </CalculatorButton>
          <CalculatorButton
            id="+"
            onClick={() => handleOperator('+')}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            +
          </CalculatorButton>

          {/* Row 4 */}
          <CalculatorButton id="1" onClick={() => handleNumber('1')}>
            1
          </CalculatorButton>
          <CalculatorButton id="2" onClick={() => handleNumber('2')}>
            2
          </CalculatorButton>
          <CalculatorButton id="3" onClick={() => handleNumber('3')}>
            3
          </CalculatorButton>
          <CalculatorButton
            id="="
            onClick={handleEquals}
            variant="default"
            className="row-span-2 bg-accent text-accent-foreground hover:bg-accent/90 h-auto"
          >
            =
          </CalculatorButton>

          {/* Row 5 */}
          <CalculatorButton
            id="0"
            onClick={() => handleNumber('0')}
            className="col-span-2"
          >
            0
          </CalculatorButton>
          <CalculatorButton id="." onClick={handleDecimal}>
            .
          </CalculatorButton>
        </motion.div>
      </Card>

      {/* Keyboard shortcuts info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center text-xs text-muted-foreground"
      >
        <p>Keyboard shortcuts: Numbers (0-9), Operators (+, -, *, /), Enter/= (equals), Esc (clear)</p>
      </motion.div>
    </motion.div>
  );
}