'use client';

import { useState, memo } from 'react';
import { Copy, RotateCcw, Download } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { toast } from 'sonner';
import { StopIcon } from '@/components/icons';
import { Spinner, EnhancedSpinner } from '@/components/ui/spinner';
import { PreviewComponent } from './preview-component';

interface BuilderViewProps {
  prompt: string;
  streamingCode: string;
  generatedCode: string;
  isGenerating: boolean;
  isStreamingComplete: boolean;
  selectedModels?: string[];
  onBack: () => void;
  onReset: () => void;
  onStop: () => void;
}

const BuilderViewComponent = ({
  prompt,
  streamingCode,
  generatedCode,
  isGenerating,
  isStreamingComplete,
  selectedModels = [],
  onBack,
  onReset,
  onStop
}: BuilderViewProps) => {
  const [editorValue, setEditorValue] = useState('');

  const handleCopy = () => {
    const code = generatedCode || streamingCode;
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard!');
  };

  const handleExport = () => {
    const code = generatedCode || streamingCode;
    const blob = new Blob([code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'component.tsx';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Code exported successfully!');
  };

  const handleEditorChange = (value: string | undefined) => {
    if (!isGenerating && value !== undefined) {
      setEditorValue(value);
    }
  };

  return (
    <div className="h-screen bg-white flex flex-col">
      <div className="border-b border-orange px-3 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full">
          <button
            onClick={onBack}
            className="px-3 sm:px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 text-sm sm:text-base"
          >
            ← Back
          </button>
          <div className="h-6 w-px bg-orange hidden sm:block" />
          <button
            onClick={onReset}
            className="px-3 sm:px-4 py-2 text-black hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 text-sm sm:text-base"
            title="Start fresh with a new project"
          >
            <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">New Project</span>
            <span className="sm:hidden">New</span>
          </button>
          <div className="h-6 w-px bg-orange hidden sm:block" />
          <h2 className="text-xs sm:text-sm text-gray-600 max-w-xs sm:max-w-md truncate flex-1">{prompt}</h2>
          {selectedModels.length > 0 && (
            <div className="flex items-center gap-1 sm:gap-2 ml-auto">
              <span className="text-xs text-gray-500 hidden sm:inline">Models:</span>
              <div className="flex items-center gap-1">
                {selectedModels.slice(0, 1).map((model, index) => (
                  <span key={model} className="text-xs bg-[#fff5f0] text-[#ff6600] px-2 py-1 rounded-full border border-orange">
                    {model.includes('llama-3.3') ? 'Llama 3.3' :
                     model.includes('llama-4-maverick') ? 'Llama 4M' :
                     model.includes('llama-4-scout') ? 'Llama 4S' :
                     model.includes('gpt-oss') ? 'GPT-OSS' :
                     model.includes('kimi') ? 'Kimi K2' : 'AI'}
                  </span>
                ))}
                {selectedModels.length > 1 && (
                  <span className="text-xs text-gray-500">+{selectedModels.length - 1} more</span>
                )}
              </div>
            </div>
          )}
        </div>
        {isGenerating && (
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <EnhancedSpinner
              size={28}
              message="Generating"
              subMessage={`${streamingCode?.length || 0} chars`}
            />
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col sm:flex-row overflow-hidden tablet-spacing">
        <div className="w-full sm:w-1/2 border-b sm:border-r sm:border-b-0 border-orange flex flex-col">
          <div className="border-b border-orange px-4 sm:px-6 py-3 flex items-center justify-between bg-gray-50">
            <div className="flex items-center gap-2 sm:gap-3">
              <h3 className="font-medium text-black text-sm sm:text-base">Code</h3>
              {isStreamingComplete && (
                <div className="flex items-center gap-1 text-green-600">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-xs font-medium">Complete</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              {streamingCode && (
                <span className="text-xs text-gray-500 mr-1 sm:mr-2">
                  {streamingCode.length} chars
                </span>
              )}
              <button
                onClick={handleCopy}
                disabled={!generatedCode && !streamingCode}
                className="p-1.5 sm:p-2 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Copy code"
              >
                <Copy className="w-3 h-3 sm:w-4 sm:h-4 text-black" />
              </button>
              <button
                onClick={handleExport}
                disabled={!generatedCode && !streamingCode}
                className="p-1.5 sm:p-2 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Export code"
              >
                <Download className="w-3 h-3 sm:w-4 sm:h-4 text-black" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden min-h-[200px] sm:min-h-0">
            <Editor
              height="100%"
              defaultLanguage="typescript"
              value={editorValue || streamingCode || generatedCode}
              theme="vs-light"
              options={{
                readOnly: isGenerating,
                minimap: { enabled: false },
                fontSize: 12,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                // Performance optimizations
                wordWrap: 'on',
                folding: false,
                lineDecorationsWidth: 0,
                lineNumbersMinChars: 3,
                renderLineHighlight: 'none',
                hideCursorInOverviewRuler: true,
                overviewRulerLanes: 0,
                overviewRulerBorder: false,
                scrollbar: {
                  vertical: 'visible',
                  horizontal: 'visible',
                  useShadows: false,
                  verticalHasArrows: false,
                  horizontalHasArrows: false,
                },
              }}
              onChange={handleEditorChange}
              onMount={(editor) => {
                // Configure Monaco for better performance
                interface MonacoWindow extends Window {
                  monaco?: {
                    languages: {
                      typescript: {
                        typescriptDefaults: {
                          setCompilerOptions(options: Record<string, unknown>): void;
                          setDiagnosticsOptions(options: Record<string, unknown>): void;
                        };
                        ScriptTarget: { ES2020: number };
                        ModuleResolutionKind: { NodeJs: number };
                        ModuleKind: { CommonJS: number };
                        JsxEmit: { React: number };
                      };
                    };
                  };
                }
                const monaco = (window as MonacoWindow).monaco;
                if (monaco) {
                  // Only register TypeScript language for better performance
                  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
                    target: monaco.languages.typescript.ScriptTarget.ES2020,
                    allowNonTsExtensions: true,
                    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
                    module: monaco.languages.typescript.ModuleKind.CommonJS,
                    noEmit: true,
                    esModuleInterop: true,
                    jsx: monaco.languages.typescript.JsxEmit.React,
                    reactNamespace: 'React',
                    allowJs: true,
                    typeRoots: ['node_modules/@types'],
                  });

                  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
                    noSemanticValidation: false,
                    noSyntaxValidation: false,
                    noSuggestionDiagnostics: true, // Disable suggestions for performance
                  });
                }
              }}
            />
          </div>
        </div>

        <div className="w-full sm:w-1/2 flex flex-col">
          <div className="border-b border-orange px-4 sm:px-6 py-3 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <h3 className="font-medium text-black text-sm sm:text-base">Live Preview</h3>
              {(generatedCode || streamingCode) && (
                <div className="flex items-center gap-1 text-green-600">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-xs font-medium">Live</span>
                </div>
              )}
            </div>
            {(generatedCode || streamingCode) && (
              <button
                onClick={() => window.open('about:blank', '_blank')}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
                title="Open in new tab"
              >
                Pop out →
              </button>
            )}
          </div>
          <div className="flex-1 overflow-auto bg-white min-h-[200px] sm:min-h-0">
            <PreviewComponent
              isGenerating={isGenerating}
              streamingCode={streamingCode}
              generatedCode={generatedCode}
              isStreamingComplete={isStreamingComplete}
            />
          </div>
        </div>
      </div>

      {isGenerating && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
          <button
            onClick={onStop}
            className="px-6 py-3 bg-black text-white rounded-full flex items-center gap-2 hover:bg-gray-800 transition-colors shadow-lg"
          >
            <StopIcon size={16} />
            Stop Generating
          </button>
        </div>
      )}
    </div>
  );
};

BuilderViewComponent.displayName = 'BuilderView';

export const BuilderView = memo(BuilderViewComponent);
