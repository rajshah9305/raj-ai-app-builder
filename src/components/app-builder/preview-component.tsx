'use client';

import { useState, useEffect, useRef, memo } from 'react';
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
  const [iframeKey, setIframeKey] = useState(0);
  const prevCodeRef = useRef<string>('');

  const codeToRender = generatedCode || streamingCode;

  useEffect(() => {
    if (codeToRender && codeToRender !== prevCodeRef.current) {
      setPreviewError(null);
      setIframeKey(prev => prev + 1); // Force iframe reload
      prevCodeRef.current = codeToRender;
    }
  }, [codeToRender]);

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
  const cleanCode = codeToRender
    .replace(/```[\w]*\n?/g, '') // Remove markdown code blocks
    .replace(/```\n?/g, '') // Remove closing code blocks
    .trim();

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
            const Component = window.default ||
                             window[Object.keys(window).find(key => key.includes('Component'))] ||
                             window[Object.keys(window).find(key => key.includes('function') || key.includes('const'))] ||
                             (() => React.createElement('div', {className: 'p-4 text-center text-gray-600'},
                               React.createElement('p', {}, 'Component loaded but not rendered'),
                               React.createElement('p', {className: 'text-sm mt-2'}, 'Check console for errors')
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
        key={iframeKey}
        srcDoc={iframeContent}
        className="w-full h-full border-0"
        sandbox="allow-scripts allow-same-origin"
        title="App Preview"
        onLoad={() => {
          // Handle iframe load
          console.log('Preview iframe loaded');
        }}
        onError={() => {
          setPreviewError('Failed to load preview');
        }}
      />

      {/* Success overlay when streaming completes */}
      {isStreamingComplete && !generatedCode && (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">App Generated!</h3>
            <p className="text-sm text-gray-600">Your live preview is ready</p>
          </div>
        </div>
      )}
    </div>
  );
};

PreviewComponentInternal.displayName = 'PreviewComponent';

export const PreviewComponent = memo(PreviewComponentInternal);
