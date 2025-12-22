'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { InputForm } from '@/components/app-builder/input-form';
import { BuilderView } from '@/components/app-builder/builder-view';
import { log } from '@/lib/logger';
import { Project, ProjectFile, GenerationResult } from '@/types';

const AIAppBuilder = () => {
  const [view, setView] = useState<'input' | 'builder'>('input');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [streamingCode, setStreamingCode] = useState('');
  const [selectedModels, setSelectedModels] = useState<string[]>(['llama-3.3-70b-versatile']);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isStreamingComplete, setIsStreamingComplete] = useState(false);

  const handleRealStreaming = useCallback(async (code: string) => {
    try {
      setStreamingCode('');
      setIsStreamingComplete(false);

      // Simulate streaming by breaking the code into chunks
      // In a real implementation, this would come from the API streaming response
      const chunks = code.split('\n');
      let accumulatedCode = '';
      let chunkIndex = 0;

      const streamInterval = setInterval(() => {
        if (chunkIndex < chunks.length) {
          accumulatedCode += chunks[chunkIndex] + '\n';
          setStreamingCode(accumulatedCode);
          chunkIndex++;
        } else {
          clearInterval(streamInterval);
          setIsStreamingComplete(true);
          setIsGenerating(false);
          setGeneratedCode(accumulatedCode);
          toast.success('Code generated successfully!');
        }
      }, 100); // Stream at 100ms intervals

    } catch (error) {
      console.error('Streaming error:', error);
      setIsGenerating(false);
      toast.error('Failed to generate code');
    }
  }, []);

  const handleSubmit = async (userPrompt: string, models: string[]) => {
    log.userAction('submit_prompt', { promptLength: userPrompt.length, modelsCount: models.length });

    if (!userPrompt.trim()) {
      log.warn('Empty prompt submitted');
      toast.error('Please enter a prompt');
      return;
    }

    if (models.length === 0) {
      toast.error('Please select at least one AI model');
      return;
    }

    setPrompt(userPrompt);
    setSelectedModels(models);

    if (!currentProject) {
      console.log('Creating project...');
      // Create project first
      try {
        const response = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: userPrompt.split(' ').slice(0, 3).join(' ') + ' App',
            description: userPrompt,
          }),
        });

        const project = await response.json() as Project;
        console.log('Project creation response:', response.status, project);

        if (response.ok) {
          setCurrentProject(project);
          console.log('Project created successfully:', project);

          console.log('Switching to builder view and starting generation...');
          setView('builder');
          setIsGenerating(true);

          try {
            console.log('Calling generate API with projectId:', project.id);
            const generateResponse = await fetch('/api/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                projectId: project.id,
                prompt: userPrompt.trim(),
                models: models,
              }),
            });

            const result = await generateResponse.json() as GenerationResult;

          if (result.success && result.files && result.files.length > 0) {
            log.info('Generation successful', {
              projectId: currentProject?.id,
              filesCount: result.files.length,
              promptLength: userPrompt.length,
            });

            const mainFile = result.files.find((f: ProjectFile) => f.path === 'src/app/page.tsx');
            if (mainFile) {
              await handleRealStreaming(mainFile.content);
            } else {
              setIsGenerating(false);
              toast.success('Code generated successfully!');
            }
          } else {
            log.error('Generation failed', { error: result.error, projectId: currentProject?.id });
            setIsGenerating(false);
            toast.error(result.error || 'Generation failed');
          }
          } catch (error) {
            log.error('Generation error', { error: error instanceof Error ? error.message : 'Unknown error', projectId: currentProject?.id });
            setIsGenerating(false);
            toast.error('Failed to generate code');
          }

          return; // Exit early since we handled the generation
        } else {
          toast.error(project.error || 'Failed to create project');
          return;
        }
      } catch (error) {
        console.error('Project creation error:', error);
        toast.error('Failed to create project');
        return;
      }
    }

    console.log('Switching to builder view and starting generation...');
    setView('builder');
    setIsGenerating(true);

    try {
      console.log('Calling generate API with projectId:', currentProject.id);
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: currentProject.id,
          prompt: userPrompt.trim(),
          models: models,
        }),
      });

      const result = await response.json() as GenerationResult;
      console.log('Generation response:', response.status, result);

      if (result.success && result.files.length > 0) {
        const mainFile = result.files.find((f: ProjectFile) => f.path === 'src/app/page.tsx');
        if (mainFile) {
          console.log('Found main file, starting real streaming...');
          await handleRealStreaming(mainFile.content);
        } else {
          setIsGenerating(false);
          toast.success('Code generated successfully!');
        }
      } else {
        setIsGenerating(false);
        toast.error(result.error || 'Generation failed');
      }
    } catch (error) {
      console.error('Generation error:', error);
      setIsGenerating(false);
      toast.error('Failed to generate code');
    }
  };

  const handleStop = () => {
    setIsGenerating(false);
    setGeneratedCode(streamingCode);
  };

  const handleReset = () => {
    setView('input');
    setPrompt('');
    setGeneratedCode('');
    setStreamingCode('');
    setIsGenerating(false);
    setCurrentProject(null);
    setSelectedModels(['llama-3.3-70b-versatile']);
  };

  const handleBack = () => {
    setView('input');
  };

  if (view === 'input') {
    return <InputForm onSubmit={handleSubmit} isGenerating={isGenerating} />;
  }

  return (
    <BuilderView
      prompt={prompt}
      streamingCode={streamingCode}
      generatedCode={generatedCode}
      isGenerating={isGenerating}
      isStreamingComplete={isStreamingComplete}
      selectedModels={selectedModels}
      onBack={handleBack}
      onReset={handleReset}
      onStop={handleStop}
    />
  );
};

export default AIAppBuilder;
