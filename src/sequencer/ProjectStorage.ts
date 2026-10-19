import { ProjectData, ModifierType } from '../grid/HexTypes';

const STORAGE_KEY = 'hexabeat_saved_projects';

const MOD_MAP: Record<ModifierType, number> = {
  'NONE': 0,
  'DIR_R': 1,
  'DIR_BR': 2,
  'DIR_BL': 3,
  'DIR_L': 4,
  'DIR_TL': 5,
  'DIR_TR': 6,
  'DIR_0': 1,
  'DIR_1': 2,
  'DIR_2': 3,
  'DIR_3': 4,
  'DIR_4': 5,
  'DIR_5': 6,
};

const REVERSE_MOD_MAP: Record<number, ModifierType> = {
  0: 'NONE',
  1: 'DIR_R',
  2: 'DIR_BR',
  3: 'DIR_BL',
  4: 'DIR_L',
  5: 'DIR_TL',
  6: 'DIR_TR',
};

function toUrlSafeBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) {
    bin += String.fromCharCode(bytes[i]);
  }
  return btoa(bin)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function fromUrlSafeBase64(b64: string): string {
  let base64 = b64.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

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

  public static encodeProjectToUrl(project: ProjectData, baseUrl?: string): string {
    const activeHeadIds = project.playheads
      ? project.playheads.filter(p => p.active).map(p => p.id)
      : [1, 2];

    const compactCells: [number, number, number, number, number][] = [];
    for (const c of project.cells) {
      const modCode = MOD_MAP[c.modifier] || 0;
      if (c.enabled || c.isDead || modCode !== 0) {
        compactCells.push([
          c.q,
          c.r,
          c.enabled ? 1 : 0,
          c.isDead ? 1 : 0,
          modCode
        ]);
      }
    }

    const payload = {
      v: 1,
      n: (project.name || 'Groove').trim(),
      b: project.bpm || 128,
      h: activeHeadIds,
      c: compactCells
    };

    const b64 = toUrlSafeBase64(JSON.stringify(payload));
    let base = baseUrl;
    if (!base && typeof window !== 'undefined' && window.location) {
      base = `${window.location.origin}${window.location.pathname}`;
    }
    return `${base || ''}#p=${b64}`;
  }

  public static decodeProjectFromUrl(urlOrHash?: string): ProjectData | null {
    try {
      let raw = urlOrHash;
      if (!raw && typeof window !== 'undefined' && window.location) {
        raw = window.location.hash || window.location.search;
      }
      if (!raw) return null;

      let b64 = '';
      const match = raw.match(/[?#&](?:p|project)=([A-Za-z0-9_-]+)/);
      if (match) {
        b64 = match[1];
      } else if (raw.startsWith('#') || raw.startsWith('?')) {
        const direct = raw.substring(1).replace(/^(?:p|project)=/, '');
        if (/^[A-Za-z0-9_-]+$/.test(direct)) {
          b64 = direct;
        }
      }
      if (!b64) return null;

      const jsonStr = fromUrlSafeBase64(b64);
      const parsed = JSON.parse(jsonStr);
      if (!parsed || typeof parsed !== 'object') return null;

      const name = typeof parsed.n === 'string' && parsed.n.trim() ? parsed.n.trim() : 'Shared Project';
      const bpm = typeof parsed.b === 'number' && parsed.b >= 40 && parsed.b <= 300 ? parsed.b : 128;
      const activeHeadIds: number[] = Array.isArray(parsed.h) ? parsed.h : [1, 2];

      const playheads = [1, 2, 3, 4, 5, 6].map(id => ({
        id,
        active: activeHeadIds.includes(id)
      }));

      const cells: ProjectData['cells'] = [];
      if (Array.isArray(parsed.c)) {
        for (const item of parsed.c) {
          if (Array.isArray(item) && item.length >= 2) {
            const q = Number(item[0]);
            const r = Number(item[1]);
            const enabled = Boolean(item[2]);
            const isDead = Boolean(item[3]);
            const modCode = Number(item[4] || 0);
            const modifier = REVERSE_MOD_MAP[modCode] || 'NONE';
            cells.push({ q, r, enabled, isDead, modifier });
          }
        }
      }

      return {
        id: `proj_shared_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name,
        bpm,
        updatedAt: Date.now(),
        gridRadius: 5,
        cells,
        playheads
      };
    } catch (err) {
      console.warn('Failed to decode project from URL:', err);
      return null;
    }
  }
}
