import { Preset } from '../grid/HexTypes';

export const PRESETS: Preset[] = [
  {
    id: 'techno-drive',
    name: 'Techno Drive',
    bpm: 128,
    playheads: [
      { id: 1, q: 0, r: 0, dir: 0, active: true },
      { id: 2, q: 0, r: 0, dir: 2, active: true },
      { id: 3, q: 0, r: 0, dir: 4, active: false }
    ],
    cells: [
      // Ring groove looping around center (Center 0,0 has NO sound)
      { q: 1, r: 0, sound: 'CLOSED_HH', modifier: 'DIR_BR' },
      { q: 1, r: 1, sound: 'SNARE', modifier: 'DIR_BL' },
      { q: 0, r: 2, sound: 'KICK', modifier: 'DIR_L' },
      { q: -1, r: 1, sound: 'CLOSED_HH', modifier: 'DIR_TL' },
      { q: -2, r: 0, sound: 'KICK', modifier: 'DIR_TR' },
      { q: -1, r: -1, sound: 'SNARE', modifier: 'DIR_R' },
      { q: 0, r: -2, sound: 'CLAP', modifier: 'DIR_BR' },
      { q: 1, r: -1, sound: 'OPEN_HH', modifier: 'DIR_R' },
      // Melodic accents
      { q: 2, r: 0, sound: 'SYNTH', modifier: 'DIR_TL' },
      { q: -2, r: 1, sound: 'SYNTH', modifier: 'DIR_TR' }
    ]
  },
  {
    id: 'polyrhythm-orbit',
    name: 'Hex Polyrhythm',
    bpm: 120,
    playheads: [
      { id: 1, q: 0, r: 0, dir: 0, active: true },
      { id: 2, q: 0, r: 0, dir: 2, active: true },
      { id: 3, q: 0, r: 0, dir: 4, active: true }
    ],
    cells: [
      // Outer ring reflectors (Center 0,0 has NO sound)
      { q: 2, r: -2, sound: 'KICK', modifier: 'DIR_BR' },
      { q: 2, r: 0, sound: 'SNARE', modifier: 'DIR_BL' },
      { q: 0, r: 2, sound: 'CLAP', modifier: 'DIR_L' },
      { q: -2, r: 2, sound: 'KICK', modifier: 'DIR_TL' },
      { q: -2, r: 0, sound: 'SNARE', modifier: 'DIR_TR' },
      { q: 0, r: -2, sound: 'OPEN_HH', modifier: 'DIR_R' },
      // Ring 1 inner deflectors
      { q: 1, r: 0, sound: 'CLOSED_HH', modifier: 'DIR_TR' },
      { q: -1, r: 0, sound: 'CLOSED_HH', modifier: 'DIR_BL' },
      { q: 0, r: 1, sound: 'CLOSED_HH', modifier: 'DIR_TL' },
      { q: 0, r: -1, sound: 'CLOSED_HH', modifier: 'DIR_BR' },
      { q: 1, r: -1, sound: 'SYNTH', modifier: 'DIR_L' },
      { q: -1, r: 1, sound: 'SYNTH', modifier: 'DIR_R' }
    ]
  },
  {
    id: 'idm-glitch',
    name: 'IDM Generative',
    bpm: 135,
    playheads: [
      { id: 1, q: 0, r: 0, dir: 1, active: true },
      { id: 2, q: 0, r: 0, dir: 3, active: true },
      { id: 3, q: 0, r: 0, dir: 5, active: false }
    ],
    cells: [
      // Generative cluster: default unrouted (NONE) moves randomly!
      { q: 1, r: 0, sound: 'CLOSED_HH', modifier: 'DIR_BR' },
      { q: -1, r: 0, sound: 'OPEN_HH', modifier: 'DIR_TL' },
      { q: 0, r: 1, sound: 'SNARE', modifier: 'NONE' },
      { q: 0, r: -1, sound: 'CLAP', modifier: 'NONE' },
      { q: 1, r: -1, sound: 'SYNTH', modifier: 'DIR_L' },
      { q: -1, r: 1, sound: 'SYNTH', modifier: 'DIR_R' },
      { q: 2, r: -1, sound: 'KICK', modifier: 'DIR_BL' },
      { q: -2, r: 1, sound: 'SNARE', modifier: 'DIR_TR' },
      { q: 1, r: 1, sound: 'DEAD', modifier: 'NONE' },
      { q: -1, r: -1, sound: 'DEAD', modifier: 'NONE' }
    ]
  },
  {
    id: 'blank',
    name: 'Empty Canvas',
    bpm: 120,
    playheads: [
      { id: 1, q: 0, r: 0, dir: 0, active: true },
      { id: 2, q: 0, r: 0, dir: 2, active: false },
      { id: 3, q: 0, r: 0, dir: 4, active: false }
    ],
    cells: []
  }
];
