import { ProjectData } from '../grid/HexTypes';

const STORAGE_KEY = 'hexabeat_saved_projects';

export class ProjectStorage {
  public static listProjects(): ProjectData[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      }
      return [];
    } catch (err) {
      console.error('Failed to load projects from localStorage:', err);
      return [];
    }
  }

  public static getProject(id: string): ProjectData | null {
    const list = this.listProjects();
    return list.find(p => p.id === id) || null;
  }

  public static saveProject(project: ProjectData): ProjectData {
    const list = this.listProjects();
    const existingIndex = list.findIndex(
      p => p.id === project.id || p.name.trim().toLowerCase() === project.name.trim().toLowerCase()
    );

    const savedRecord: ProjectData = {
      ...project,
      id: existingIndex >= 0 ? list[existingIndex].id : project.id || `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      updatedAt: Date.now()
    };

    if (existingIndex >= 0) {
      list[existingIndex] = savedRecord;
    } else {
      list.unshift(savedRecord);
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (err) {
      console.error('Failed to save project to localStorage:', err);
    }

    return savedRecord;
  }

  public static deleteProject(id: string): void {
    const list = this.listProjects().filter(p => p.id !== id);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (err) {
      console.error('Failed to update localStorage after deletion:', err);
    }
  }

  public static exportToFile(project: ProjectData): void {
    const jsonStr = JSON.stringify(project, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const safeName = (project.name || 'project').toLowerCase().replace(/[^a-z0-9_-]/gi, '_');
    const filename = `${safeName}.hexabeat.json`;

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  public static importFromFile(file: File): Promise<ProjectData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content);
          if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.cells)) {
            throw new Error('Invalid project file format (missing cells array)');
          }

          const fallbackName = file.name.replace(/\.(hexabeat\.)?json$/i, '').trim();
          const project: ProjectData = {
            id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            name: typeof parsed.name === 'string' && parsed.name.trim() ? parsed.name.trim() : fallbackName || 'Imported Project',
            bpm: typeof parsed.bpm === 'number' && parsed.bpm >= 40 && parsed.bpm <= 300 ? parsed.bpm : 120,
            updatedAt: Date.now(),
            gridRadius: parsed.gridRadius || 5,
            cells: parsed.cells.map((c: any) => ({
              q: Number(c.q),
              r: Number(c.r),
              enabled: Boolean(c.enabled),
              isDead: Boolean(c.isDead),
              modifier: c.modifier || 'NONE'
            })),
            playheads: Array.isArray(parsed.playheads) ? parsed.playheads : undefined
          };

          resolve(project);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file from disk'));
      reader.readAsText(file);
    });
  }
}
