import { useState, useCallback } from 'react';

interface StreamResponse {
  isStreaming: boolean;
  generatedCode: string;
  error: string | null;
  startGeneration: (prompt: string, apiKey: string) => Promise<void>;
  stopGeneration: () => void;
}

export function useCerebrasStream(): StreamResponse {
  const [isStreaming, setIsStreaming] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const startGeneration = useCallback(async (prompt: string, apiKey: string) => {
    if (!apiKey) {
      setError('API key is required');
      return;
    }

    setIsStreaming(true);
    setError(null);
    setGeneratedCode('');

    const controller = new AbortController();
    setAbortController(controller);

    try {
      // Enhanced system prompt for React component generation
      const systemPrompt = `You are an expert React developer. Generate clean, production-ready React components using TypeScript. 

Rules:
- Always use functional components with hooks
- Include proper TypeScript interfaces for props
- Use modern React patterns (useState, useEffect, etc.)
- Import React if needed
- Use semantic HTML and accessible markup
- Add proper className for styling with Tailwind CSS
- Include error handling where appropriate
- Make components interactive and functional
- Export the component as default

Generate ONLY the React component code, no explanations or markdown formatting.`;

      const messages = [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `Create a React component for: ${prompt}`
        }
      ];

      // Simulate Cerebras API streaming (since we can't make actual API calls in this environment)
      // In production, this would be replaced with actual Cerebras API integration
      const simulateStreaming = async () => {
        const sampleComponent = `import React, { useState } from 'react';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

interface TodoAppProps {
  initialTodos?: TodoItem[];
}

export default function TodoApp({ initialTodos = [] }: TodoAppProps) {
  const [todos, setTodos] = useState<TodoItem[]>(initialTodos);
  const [inputValue, setInputValue] = useState('');

  const addTodo = () => {
    if (inputValue.trim()) {
      const newTodo: TodoItem = {
        id: Date.now().toString(),
        text: inputValue.trim(),
        completed: false
      };
      setTodos([...todos, newTodo]);
      setInputValue('');
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Todo List</h1>
      
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add a new todo..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={addTodo}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Add
        </button>
      </div>

      <ul className="space-y-2">
        {todos.map((todo) => (
          <li
            key={todo.id}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-md"
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span
              className={
                todo.completed
                  ? 'flex-1 text-gray-500 line-through'
                  : 'flex-1 text-gray-800'
              }
            >
              {todo.text}
            </span>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="px-2 py-1 text-red-600 hover:bg-red-100 rounded"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      {todos.length === 0 && (
        <p className="text-gray-500 text-center py-8">No todos yet. Add one above!</p>
      )}
    </div>
  );
}`;

        // Simulate character-by-character streaming
        const chars = sampleComponent.split('');
        let currentCode = '';
        
        for (let i = 0; i < chars.length; i++) {
          if (controller.signal.aborted) {
            throw new Error('Generation cancelled');
          }

          currentCode += chars[i];
          setGeneratedCode(currentCode);
          
          // Vary the delay to simulate realistic streaming
          const delay = chars[i] === '\n' ? 50 : Math.random() * 30 + 10;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      };

      await simulateStreaming();

    } catch (err: any) {
      if (err.name === 'AbortError' || err.message === 'Generation cancelled') {
        setError('Generation cancelled');
      } else {
        setError(err.message || 'Failed to generate component');
      }
    } finally {
      setIsStreaming(false);
      setAbortController(null);
    }
  }, []);

  const stopGeneration = useCallback(() => {
    if (abortController) {
      abortController.abort();
    }
  }, [abortController]);

  return {
    isStreaming,
    generatedCode,
    error,
    startGeneration,
    stopGeneration
  };
}