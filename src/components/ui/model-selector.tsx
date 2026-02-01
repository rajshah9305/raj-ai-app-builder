'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, CheckIcon, SparklesIcon } from '@/components/icons';

export interface AIModel {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: 'llama' | 'gpt' | 'kimi';
  maxTokens: number;
  features: string[];
  recommended?: boolean;
}

export const AI_MODELS: AIModel[] = [
  {
    id: 'llama-3.3-70b-versatile',
    name: 'llama-3.3-70b-versatile',
    displayName: 'Llama 3.3 70B Versatile',
    description: 'Most capable model for complex code generation and reasoning',
    category: 'llama',
    maxTokens: 32768,
    features: ['Code Generation', 'Complex Reasoning', 'Large Context'],
    recommended: true,
  },
  {
    id: 'meta-llama/llama-4-maverick-17b-128e-instruct',
    name: 'meta-llama/llama-4-maverick-17b-128e-instruct',
    displayName: 'Llama 4 Maverick 17B',
    description: 'Advanced reasoning with efficient performance',
    category: 'llama',
    maxTokens: 8192,
    features: ['Advanced Reasoning', 'Fast Inference', 'Efficient'],
  },
  {
    id: 'meta-llama/llama-4-scout-17b-16e-instruct',
    name: 'meta-llama/llama-4-scout-17b-16e-instruct',
    displayName: 'Llama 4 Scout 17B',
    description: 'Optimized for speed with good quality output',
    category: 'llama',
    maxTokens: 8192,
    features: ['Fast Inference', 'Good Quality', 'Lightweight'],
  },
  {
    id: 'openai/gpt-oss-120b',
    name: 'openai/gpt-oss-120b',
    displayName: 'GPT-OSS 120B',
    description: 'Open-source GPT with built-in tools and web search',
    category: 'gpt',
    maxTokens: 8192,
    features: ['Tool Use', 'Web Search', 'Code Interpreter'],
  },
  {
    id: 'moonshotai/kimi-k2-instruct-0905',
    name: 'moonshotai/kimi-k2-instruct-0905',
    displayName: 'Kimi K2 Instruct',
    description: 'Specialized for coding tasks with excellent accuracy',
    category: 'kimi',
    maxTokens: 16384,
    features: ['Coding Specialist', 'High Accuracy', 'Large Context'],
  },
];

interface ModelSelectorProps {
  selectedModels: string[];
  onModelChange: (models: string[]) => void;
  className?: string;
  disabled?: boolean;
}

export const ModelSelector = ({ selectedModels, onModelChange, className = '', disabled = false }: ModelSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleModelToggle = (modelId: string) => {
    const newSelection = selectedModels.includes(modelId)
      ? selectedModels.filter(id => id !== modelId)
      : [...selectedModels, modelId];
    
    onModelChange(newSelection);
  };

  const getSelectedModelsDisplay = () => {
    if (selectedModels.length === 0) return 'Select AI Models';
    if (selectedModels.length === 1) {
      const model = AI_MODELS.find(m => m.id === selectedModels[0]);
      return model?.displayName || 'Unknown Model';
    }
    return `${selectedModels.length} models selected`;
  };

  const getCategoryIcon = (category: AIModel['category']) => {
    switch (category) {
      case 'llama':
        return '🦙';
      case 'gpt':
        return '🤖';
      case 'kimi':
        return '✨';
      default:
        return '🔮';
    }
  };

  const getCategoryColor = (category: AIModel['category']) => {
    switch (category) {
      case 'llama':
        return 'bg-blue-50 border-orange';
      case 'gpt':
        return 'bg-green-50 border-orange';
      case 'kimi':
        return 'bg-purple-50 border-orange';
      default:
        return 'bg-gray-50 border-orange';
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-1.5 bg-transparent border border-orange rounded-md hover:border-orange focus:outline-none focus:ring-1 focus:ring-orange transition-colors text-xs sm:text-xs ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <SparklesIcon size={12} className="text-orange sm:size-3.5" />
        <span className="text-gray-600 text-xs sm:text-xs">
          {selectedModels.length === 0 ? 'Select AI' : 
           selectedModels.length === 1 ? AI_MODELS.find(m => m.id === selectedModels[0])?.displayName?.split(' ')[0] || 'AI' :
           `${selectedModels.length} models`}
        </span>
        <ChevronDownIcon 
          size={10} 
          className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''} sm:size-3`} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full right-0 mb-1 w-64 sm:w-80 bg-white border border-orange rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
          >
            <div className="p-2">
              <div className="px-3 py-2 text-sm font-medium text-gray-500 border-b border-orange">
                Select AI Models (Multi-select supported)
              </div>
              
              {AI_MODELS.map((model) => (
                <motion.div
                  key={model.id}
                  whileHover={{ backgroundColor: '#f9fafb' }}
                  className="relative"
                >
                  <button
                    onClick={() => handleModelToggle(model.id)}
                    disabled={disabled}
                    className={`w-full p-2 text-left hover:bg-gray-50 rounded-md transition-colors text-sm ${
                      selectedModels.includes(model.id) ? 'bg-orange/10 border border-orange' : ''
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 sm:space-x-3 mb-1 sm:mb-2">
                          <span className="text-base sm:text-lg">{getCategoryIcon(model.category)}</span>
                          <div>
                            <div className="flex items-center space-x-1 sm:space-x-2">
                              <span className="font-semibold text-black text-sm sm:text-base">{model.displayName}</span>
                              {model.recommended && (
                                <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs bg-orange text-white rounded-full">
                                  Recommended
                                </span>
                              )}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-600 mt-1">{model.description}</div>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 sm:gap-2 mb-1 sm:mb-2">
                          {model.features.map((feature) => (
                            <span
                              key={feature}
                              className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs rounded-full border ${getCategoryColor(model.category)}`}
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          Max tokens: {model.maxTokens.toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="ml-2 sm:ml-3 flex-shrink-0">
                        {selectedModels.includes(model.id) && (
                          <CheckIcon size={16} className="text-orange sm:size-5" />
                        )}
                      </div>
                    </div>
                  </button>
                </motion.div>
              ))}
            </div>
            
            <div className="p-2 sm:p-3 border-t border-orange bg-gray-50 rounded-b-xl">
              <div className="text-xs text-gray-600">
                💡 Tip: Select multiple models for enhanced reliability
              </div>
              {selectedModels.length > 1 && (
                <div className="text-xs text-orange mt-1 font-medium">
                  ✨ Multi-model mode active
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};