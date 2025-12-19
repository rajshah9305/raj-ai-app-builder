import { Project, ProjectFile, ProjectVersion } from '@/types';

interface StorageAPI {
  projects: {
    create: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Project>;
    list: () => Promise<Project[]>;
    get: (id: string) => Promise<Project | null>;
    update: (id: string, data: Partial<Project>) => Promise<Project>;
    delete: (id: string) => Promise<void>;
  };
  files: {
    create: (projectId: string, data: Omit<ProjectFile, 'id' | 'createdAt' | 'updatedAt' | 'projectId'>) => Promise<ProjectFile>;
    list: (projectId: string) => Promise<ProjectFile[]>;
    get: (projectId: string, path: string) => Promise<ProjectFile | null>;
    update: (projectId: string, path: string, content: string) => Promise<ProjectFile>;
    delete: (projectId: string, path: string) => Promise<void>;
  };
  versions: {
    create: (projectId: string, data: Omit<ProjectVersion, 'id' | 'createdAt' | 'projectId'>) => Promise<ProjectVersion>;
    list: (projectId: string) => Promise<ProjectVersion[]>;
    restore: (versionId: string) => Promise<void>;
  };
  logs: {
    add: (agent: string, level: string, message: string, context?: string) => Promise<void>;
    list: (limit?: number) => Promise<Array<{id: string; agent: string; level: string; message: string; context?: string; createdAt: Date}>>;
    clear: () => Promise<void>;
  };
}

class InMemoryStorage implements StorageAPI {
  private projectsMap: Map<string, Project> = new Map();
  private filesMap: Map<string, ProjectFile[]> = new Map();
  private versionsMap: Map<string, ProjectVersion[]> = new Map();
  private logsList: Array<{id: string; agent: string; level: string; message: string; context?: string; createdAt: Date}> = [];

  projects = {
    create: async (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
      const id = Math.random().toString(36).substring(2, 11);
      const project: Project = {
        id,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.projectsMap.set(id, project);
      this.filesMap.set(id, []);
      this.versionsMap.set(id, []);
      return project;
    },

    list: async () => Array.from(this.projectsMap.values()),

    get: async (id: string) => this.projectsMap.get(id) || null,

    update: async (id: string, data: Partial<Project>) => {
      const project = this.projectsMap.get(id);
      if (!project) throw new Error('Project not found');
      const updated = { ...project, ...data, updatedAt: new Date() };
      this.projectsMap.set(id, updated);
      return updated;
    },

    delete: async (id: string) => {
      this.projectsMap.delete(id);
      this.filesMap.delete(id);
      this.versionsMap.delete(id);
    },
  };

  files = {
    create: async (projectId: string, data: Omit<ProjectFile, 'id' | 'createdAt' | 'updatedAt' | 'projectId'>) => {
      const id = Math.random().toString(36).substring(2, 11);
      const file: ProjectFile = {
        id,
        projectId,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const projectFiles = this.filesMap.get(projectId) || [];
      projectFiles.push(file);
      this.filesMap.set(projectId, projectFiles);
      return file;
    },

    list: async (projectId: string) => this.filesMap.get(projectId) || [],

    get: async (projectId: string, path: string) => {
      const projectFiles = this.filesMap.get(projectId) || [];
      return projectFiles.find(f => f.path === path) || null;
    },

    update: async (projectId: string, path: string, content: string) => {
      const projectFiles = this.filesMap.get(projectId) || [];
      const file = projectFiles.find(f => f.path === path);
      if (!file) throw new Error('File not found');
      file.content = content;
      file.updatedAt = new Date();
      return file;
    },

    delete: async (projectId: string, path: string) => {
      const projectFiles = this.filesMap.get(projectId) || [];
      const index = projectFiles.findIndex(f => f.path === path);
      if (index >= 0) projectFiles.splice(index, 1);
    },
  };

  versions = {
    create: async (projectId: string, data: Omit<ProjectVersion, 'id' | 'createdAt' | 'projectId'>) => {
      const id = Math.random().toString(36).substring(2, 11);
      const version: ProjectVersion = {
        id,
        projectId,
        versionNumber: data.versionNumber,
        snapshot: data.snapshot,
        description: data.description,
        createdAt: new Date(),
      };
      const projectVersions = this.versionsMap.get(projectId) || [];
      projectVersions.push(version);
      this.versionsMap.set(projectId, projectVersions);
      return version;
    },

    list: async (projectId: string) => this.versionsMap.get(projectId) || [],

    restore: async (versionId: string) => {
      console.log(`Restored version: ${versionId}`);
    },
  };

  logs = {
    add: async (agent: string, level: string, message: string, context?: string) => {
      this.logsList.push({
        id: Math.random().toString(36).substring(2, 11),
        agent,
        level,
        message,
        context,
        createdAt: new Date(),
      });
    },

    list: async (limit = 100) => this.logsList.slice(-limit),

    clear: async () => {
      this.logsList = [];
    },
  };
}

export const storage = new InMemoryStorage();
