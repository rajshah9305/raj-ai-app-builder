import { ProjectFile, FileStructure } from '@/types';

export function buildFileStructure(files: ProjectFile[]): FileStructure[] {
  const structure: FileStructure[] = [];
  const map: Map<string, FileStructure> = new Map();

  files.forEach(file => {
    const parts = file.path.split('/');
    let current = structure;
    let path = '';

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      path = path ? `${path}/${part}` : part;

      if (i === parts.length - 1) {
        current.push({
          path: file.path,
          name: part,
          type: 'file',
        });
      } else {
        let folder = map.get(path);
        if (!folder) {
          folder = {
            path,
            name: part,
            type: 'folder',
            children: [],
          };
          map.set(path, folder);
          current.push(folder);
        }
        current = folder.children || [];
      }
    }
  });

  return structure;
}

