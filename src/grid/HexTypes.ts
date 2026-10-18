export type SoundType = 
  | 'NONE'
  | 'KICK'
  | 'SNARE'
  | 'CLOSED_HH'
  | 'OPEN_HH'
  | 'CLAP'
  | 'SYNTH'
  | 'DEAD';

export type ModifierType =
  | 'NONE'
  | 'DIR_TL'
  | 'DIR_TR'
  | 'DIR_L'
  | 'DIR_R'
  | 'DIR_BL'
  | 'DIR_BR'
  | 'DIR_0'
  | 'DIR_1'
  | 'DIR_2'
  | 'DIR_3'
  | 'DIR_4'
  | 'DIR_5';

export interface Cell {
  q: number;
  r: number;
  enabled: boolean;
  isDead: boolean;
  modifier: ModifierType;
  sound?: SoundType; // optional compatibility
  // Visual transient states
  lastTriggerTime?: number;
  triggerIntensity?: number;
  lastTriggerColor?: string;
}

export interface Playhead {
  id: number;
  name: string;
  sound: SoundType;
  startQ: number;
  startR: number;
  startDir: number;
  q: number;
  r: number;
  dir: number; // 0 to 5
  color: string;
  glowColor: string;
  active: boolean;
  // Interpolation for smooth 60fps rendering
  prevQ: number;
  prevR: number;
  stepProgress: number; // 0.0 to 1.0 between steps
}

export interface DirectionOffset {
  dq: number;
  dr: number;
  angle: number; // in radians
  name: string;
}

export interface Preset {
  id: string;
  name: string;
  bpm: number;
  cells: Array<{
    q: number;
    r: number;
    enabled?: boolean;
    isDead?: boolean;
    sound?: SoundType;
    modifier: ModifierType;
  }>;
  playheads: Array<{
    id: number;
    q?: number;
    r?: number;
    dir?: number;
    active: boolean;
  }>;
}
