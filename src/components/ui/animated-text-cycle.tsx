import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

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
    <motion.span
      key={currentIndex}
      className={`inline-block font-bold ${className}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3 }}
      style={{ whiteSpace: 'nowrap' }}
    >
      {words[currentIndex]}
    </motion.span>
  );
};
