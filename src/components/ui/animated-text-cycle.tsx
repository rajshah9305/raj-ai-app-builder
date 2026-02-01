import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Animated Text Cycle Component
interface AnimatedTextCycleProps {
  words: string[];
  interval?: number;
  className?: string;
}

export const AnimatedTextCycle = ({ words, interval = 3000, className = '' }: AnimatedTextCycleProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, interval);
    return () => clearInterval(timer);
  }, [interval, words.length]);

  return (
    <span className={`inline-flex flex-col h-[1.2em] overflow-hidden align-bottom ${className}`}>
      <AnimatePresence mode="wait">
        <motion.span
          key={currentIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="inline-block"
        >
          {words[currentIndex]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};
