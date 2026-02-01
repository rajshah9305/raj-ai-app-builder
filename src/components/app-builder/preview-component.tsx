'use client';

import { useState, memo } from 'react';
import { Sparkles } from 'lucide-react';
import { EnhancedSpinner } from '@/components/ui/spinner';

interface PreviewComponentProps {
  isGenerating: boolean;
  streamingCode: string;
  generatedCode: string;
  isStreamingComplete: boolean;
}

const PreviewComponentInternal = ({
  isGenerating,
  streamingCode,
  generatedCode,
  isStreamingComplete
}: PreviewComponentProps) => {
  const [previewError, setPreviewError] = useState<string | null>(null);
  const codeToRender = generatedCode || streamingCode;

  // Use state to track code changes and force updates
  const [internalState, setInternalState] = useState({ code: codeToRender, key: 0 });

  // Update state when code changes (replaces useEffect)
  if (codeToRender !== internalState.code) {
    setInternalState({ code: codeToRender, key: internalState.key + 1 });
    setPreviewError(null);
  }

  // Show enhanced loading state during initial generation
  if (isGenerating && !codeToRender) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100">
        <EnhancedSpinner
          size={80}
          message="Building your app"
          subMessage="AI is crafting the perfect components..."
        />
      </div>
    );
  }

  if (!codeToRender) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Preview will appear here</p>
        </div>
      </div>
    );
  }

  if (previewError) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        <div className="text-center">
          <div className="text-red-500 mb-2">⚠️ Preview Error</div>
          <p className="text-sm">{previewError}</p>
          <button
            onClick={() => setPreviewError(null)}
            className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Clean and format the code for the iframe
  let cleanCode = codeToRender
    .replace(/```[\w]*\n?/g, '') // Remove markdown code blocks
    .replace(/```\n?/g, '') // Remove closing code blocks
    .trim();

  // Transform export default to window assignment for browser environment
  if (cleanCode.includes('export default')) {
    cleanCode = cleanCode.replace(/export\s+default\s+(function|class|const|let|var)?\s*(\w*)?/, (match, type, name) => {
      if (name) {
        return `window.default = ${name}; ${type || ''} ${name}`;
      }
      return 'window.default =';
    });
  }

  // Create a safe, self-contained React component
  const iframeContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
        <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
          .preview-container { padding: 20px; min-height: 100vh; }
        </style>
      </head>
      <body>
        <div id="root" class="preview-container"></div>
        <script type="text/babel" data-type="module">
          try {
            ${cleanCode}

            const root = ReactDOM.createRoot(document.getElementById('root'));
            // Handle default exports by assigning to window
            if (!window.default && !window.App) {
              // Heuristic to find the component if it wasn't explicitly attached to window
              const keys = Object.keys(window);
              const componentKey = keys.find(key =>
                typeof window[key] === 'function' &&
                /^[A-Z]/.test(key) &&
                key !== 'React' &&
                key !== 'ReactDOM'
              );
              if (componentKey) window.default = window[componentKey];
            }

            const Component = window.default || window.App ||
                             (() => React.createElement('div', {className: 'p-4 text-center text-gray-600'},
                               React.createElement('p', {}, 'Component loaded but not rendered'),
                               React.createElement('p', {className: 'text-sm mt-2'}, 'Check console for errors. Ensure you export your component as default.')
                             ));

            root.render(React.createElement(Component));
          } catch (error) {
            const root = ReactDOM.createRoot(document.getElementById('root'));
            root.render(React.createElement('div', {className: 'p-4 text-center text-red-600'},
              React.createElement('p', {className: 'font-semibold'}, 'Preview Error'),
              React.createElement('p', {className: 'text-sm mt-2'}, error.message)
            ));
          }
        </script>
      </body>
    </html>
  `;

  return (
    <div className="w-full h-full relative">
      <iframe
        key={internalState.key}
        srcDoc={iframeContent}
        className="w-full h-full border-0"
        sandbox="allow-scripts allow-same-origin"
        title="App Preview"
        onLoad={() => {
          // Handle iframe load
        }}
        onError={() => {
          setPreviewError('Failed to load preview');
        }}
      />

    </div>
  );
};

PreviewComponentInternal.displayName = 'PreviewComponent';

export const PreviewComponent = memo(PreviewComponentInternal);
