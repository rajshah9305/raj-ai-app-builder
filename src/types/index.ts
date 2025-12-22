export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectFile {
  id: string;
  projectId: string;
  path: string;
  content: string;
  fileType: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectVersion {
  id: string;
  projectId: string;
  versionNumber: number;
  snapshot: string;
  description?: string;
  createdAt: Date;
}

export interface AILog {
  id: string;
  agent: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  context?: string;
  createdAt: Date;
}

export interface GenerationResult {
  files: ProjectFile[];
  logs: AILog[];
  success: boolean;
  error?: string;
}
