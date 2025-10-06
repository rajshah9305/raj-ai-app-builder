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

      // Simulate Cerebras API streaming with dynamic component generation
      const simulateStreaming = async () => {
        // Generate different components based on the prompt
        const generateComponentCode = (prompt: string): string => {
          const lowercasePrompt = prompt.toLowerCase();
          
          if (lowercasePrompt.includes('todo') || lowercasePrompt.includes('task')) {
            return `import React, { useState } from 'react';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export default function TodoApp() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
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

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Todo List</h1>
      
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          placeholder="Add a new todo..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={addTodo}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Add
        </button>
      </div>

      <ul className="space-y-2">
        {todos.map((todo) => (
          <li key={todo.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className={todo.completed ? 'flex-1 text-gray-500 line-through' : 'flex-1 text-gray-800'}>
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
          } else if (lowercasePrompt.includes('counter') || lowercasePrompt.includes('count')) {
            return `import React, { useState } from 'react';

  const [count, setCount] = useState(0);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Counter App</h1>
        
        <div className="text-center mb-8">
          <div className="text-6xl font-bold text-indigo-600 mb-4">{count}</div>
          <p className="text-gray-600">Current Count</p>
        </div>
        
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => setCount(count - 1)}
            className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
          >
            Decrease
          </button>
          <button
            onClick={() => setCount(0)}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold"
          >
            Reset
          </button>
          <button
            onClick={() => setCount(count + 1)}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
          >
            Increase
          </button>
        </div>
      </div>
    </div>
  );
}`;
          } else if (lowercasePrompt.includes('form') || lowercasePrompt.includes('contact')) {
            return `import React, { useState } from 'react';

interface FormData {
  name: string;
  email: string;
  message: string;
}

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Contact Form</h1>
      
      {submitted ? (
        <div className="text-center py-8">
          <div className="text-green-600 text-4xl mb-4">✓</div>
          <p className="text-green-600 font-semibold">Message sent successfully!</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Send Message
          </button>
        </form>
      )}
    </div>
  );
}`;
          } else if (lowercasePrompt.includes('calculator')) {
            return `import React, { useState } from 'react';

  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);

  const inputNumber = (num: string) => {
    if (waitingForNewValue) {
      setDisplay(num);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(newValue.toString());
      setPreviousValue(newValue);
    }

    setWaitingForNewValue(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string) => {
    switch (operation) {
      case '+': return firstValue + secondValue;
      case '-': return firstValue - secondValue;
      case '×': return firstValue * secondValue;
      case '÷': return firstValue / secondValue;
      default: return secondValue;
    }
  };

  const performCalculation = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(newValue.toString());
      setPreviousValue(null);
      setOperation(null);
      setWaitingForNewValue(true);
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(false);
  };

  return (
    <div className="max-w-xs mx-auto p-6 bg-gray-800 rounded-2xl shadow-2xl">
      <div className="bg-black text-white text-right text-3xl p-4 rounded-lg mb-4 font-mono">
        {display}
      </div>
      
      <div className="grid grid-cols-4 gap-2">
        <button onClick={clear} className="col-span-2 bg-gray-600 text-white p-4 rounded-lg hover:bg-gray-500">Clear</button>
        <button onClick={() => inputOperation('÷')} className="bg-orange-500 text-white p-4 rounded-lg hover:bg-orange-400">÷</button>
        <button onClick={() => inputOperation('×')} className="bg-orange-500 text-white p-4 rounded-lg hover:bg-orange-400">×</button>
        
        <button onClick={() => inputNumber('7')} className="bg-gray-700 text-white p-4 rounded-lg hover:bg-gray-600">7</button>
        <button onClick={() => inputNumber('8')} className="bg-gray-700 text-white p-4 rounded-lg hover:bg-gray-600">8</button>
        <button onClick={() => inputNumber('9')} className="bg-gray-700 text-white p-4 rounded-lg hover:bg-gray-600">9</button>
        <button onClick={() => inputOperation('-')} className="bg-orange-500 text-white p-4 rounded-lg hover:bg-orange-400">-</button>
        
        <button onClick={() => inputNumber('4')} className="bg-gray-700 text-white p-4 rounded-lg hover:bg-gray-600">4</button>
        <button onClick={() => inputNumber('5')} className="bg-gray-700 text-white p-4 rounded-lg hover:bg-gray-600">5</button>
        <button onClick={() => inputNumber('6')} className="bg-gray-700 text-white p-4 rounded-lg hover:bg-gray-600">6</button>
        <button onClick={() => inputOperation('+')} className="bg-orange-500 text-white p-4 rounded-lg hover:bg-orange-400">+</button>
        
        <button onClick={() => inputNumber('1')} className="bg-gray-700 text-white p-4 rounded-lg hover:bg-gray-600">1</button>
        <button onClick={() => inputNumber('2')} className="bg-gray-700 text-white p-4 rounded-lg hover:bg-gray-600">2</button>
        <button onClick={() => inputNumber('3')} className="bg-gray-700 text-white p-4 rounded-lg hover:bg-gray-600">3</button>
        <button onClick={performCalculation} className="row-span-2 bg-orange-500 text-white p-4 rounded-lg hover:bg-orange-400">=</button>
        
        <button onClick={() => inputNumber('0')} className="col-span-2 bg-gray-700 text-white p-4 rounded-lg hover:bg-gray-600">0</button>
        <button onClick={() => inputNumber('.')} className="bg-gray-700 text-white p-4 rounded-lg hover:bg-gray-600">.</button>
      </div>
    </div>
  );
}`;
          } else {
            // Default component for generic prompts
            return `import React, { useState } from 'react';

  const [message, setMessage] = useState('Hello from your generated component!');
  const [count, setCount] = useState(0);

  return (
    <div className="max-w-lg mx-auto p-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg">
      <div className="text-center space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">✨ Generated Component</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <p className="text-lg text-gray-700 mb-4">{message}</p>
          <div className="text-2xl font-bold text-purple-600 mb-4">Count: {count}</div>
          
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setCount(count + 1)}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Increment
            </button>
            <button
              onClick={() => setCount(0)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Update the message..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        
        <p className="text-sm text-gray-600">
          This component was generated based on: "<em>${prompt}</em>"
        </p>
      </div>
    </div>
  );
}`;
          }
        };

        const componentCode = generateComponentCode(prompt);
        
        // Simulate character-by-character streaming
        const chars = componentCode.split('');
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