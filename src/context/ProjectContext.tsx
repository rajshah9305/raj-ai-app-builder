'use client';

import { createContext, ReactNode, useState, useCallback } from 'react';
import { Project, ProjectFile, AILog } from '@/types';

interface ProjectContextType {
  currentProject: Project | null;
  files: ProjectFile[];
  logs: AILog[];
  isGenerating: boolean;

  setCurrentProject: (project: Project) => void;
  setFiles: (files: ProjectFile[]) => void;
  addFile: (file: ProjectFile) => void;
  updateFile: (path: string, content: string) => void;
  removeFile: (path: string) => void;
  
  setLogs: (logs: AILog[]) => void;
  addLog: (log: AILog) => void;
  clearLogs: () => void;
  
  setIsGenerating: (generating: boolean) => void;
}

export const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [logs, setLogs] = useState<AILog[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const addFile = useCallback((file: ProjectFile) => {
    setFiles(prev => {
      const index = prev.findIndex(f => f.path === file.path);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = file;
        return updated;
      }
      return [...prev, file];
    });
  }, []);

  const updateFile = useCallback((path: string, content: string) => {
    setFiles(prev => prev.map(f => f.path === path ? { ...f, content, updatedAt: new Date() } : f));
  }, []);

  const removeFile = useCallback((path: string) => {
    setFiles(prev => prev.filter(f => f.path !== path));
  }, []);

  const addLog = useCallback((log: AILog) => {
    setLogs(prev => [...prev, log]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const value: ProjectContextType = {
    currentProject,
    files,
    logs,
    isGenerating,
    setCurrentProject,
    setFiles,
    addFile,
    updateFile,
    removeFile,
    setLogs,
    addLog,
    clearLogs,
    setIsGenerating,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}
