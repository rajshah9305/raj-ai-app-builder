'use client';

import { useState, useRef, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import { AnimatedTextCycle } from '@/components/ui/animated-text-cycle';
import { ModelSelector, AI_MODELS } from '@/components/ui/model-selector';
import { ArrowUpIcon } from '@/components/icons';

interface InputFormProps {
  onSubmit: (prompt: string, selectedModels: string[]) => void;
  isGenerating: boolean;
}

const InputFormComponent = ({ onSubmit, isGenerating }: InputFormProps) => {
  const [prompt, setPrompt] = useState('');
  const [selectedModels, setSelectedModels] = useState<string[]>([AI_MODELS[0].id]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight + 2}px`;
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, [prompt]);

  const handleSubmit = () => {
    if (prompt.trim() && !isGenerating && selectedModels.length > 0) {
      onSubmit(prompt.trim(), selectedModels);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md sm:max-w-2xl md:max-w-3xl px-2 sm:px-0 tablet-optimized"
      >
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light mb-3 sm:mb-4 text-black">
            Build your <AnimatedTextCycle words={['app', 'component', 'interface', 'design', 'prototype']} className="text-[#ff6600]" /> with AI
          </h1>
          <p className="text-gray-600 text-base sm:text-lg tablet-text">Describe what you want to build, and watch it come to life</p>
        </div>

        <div className="relative">
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your app... (e.g., 'Create a todo list with add, delete, and mark as done features')"
            className="w-full min-h-[120px] max-h-[400px] p-4 sm:p-6 pr-16 sm:pr-24 text-black bg-white border-2 border-orange rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-[#ff6600] focus:border-transparent text-base sm:text-lg"
            rows={1}
            disabled={isGenerating}
          />
          <div className="absolute bottom-3 sm:bottom-4 right-12 sm:right-20">
            <ModelSelector
              selectedModels={selectedModels}
              onModelChange={setSelectedModels}
              disabled={isGenerating}
              className=""
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={!prompt.trim() || isGenerating || selectedModels.length === 0}
            className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 w-10 h-10 sm:w-12 sm:h-12 bg-[#ff6600] hover:bg-[#ff8533] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-colors"
          >
            <ArrowUpIcon size={16} className="sm:size-5" />
          </button>
        </div>

        <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          {[
            'Create a todo list app',
            'Build a calculator interface',
            'Design a contact form',
            'Make a weather dashboard'
          ].map((suggestion, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => {
              setPrompt(suggestion);
              if (selectedModels.length === 0) {
                setSelectedModels([AI_MODELS[0].id]);
              }
            }}
              disabled={isGenerating}
              className="p-3 sm:p-4 text-left border border-orange rounded-xl hover:border-[#ff6600] hover:bg-gray-50 transition-colors text-sm sm:text-base text-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-xs sm:text-sm">{suggestion}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

InputFormComponent.displayName = 'InputForm';

export const InputForm = memo(InputFormComponent);
