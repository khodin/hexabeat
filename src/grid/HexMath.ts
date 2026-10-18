import { DirectionOffset, Cell } from './HexTypes';

export const HEX_RADIUS = 3; // Max axial distance (gives 37 cells: rings 0, 1, 2, 3)

// 6 axial directions in pointy-topped orientation
// Order: Clockwise starting from Right / East (0 rad)
export const HEX_DIRECTIONS: DirectionOffset[] = [
  { dq: 1,  dr: 0,  angle: 0,                 name: 'R'  }, // 0: Right (East)
  { dq: 0,  dr: 1,  angle: Math.PI / 3,       name: 'BR' }, // 1: Bottom-Right (SE)
  { dq: -1, dr: 1,  angle: (2 * Math.PI) / 3, name: 'BL' }, // 2: Bottom-Left (SW)
  { dq: -1, dr: 0,  angle: Math.PI,           name: 'L'  }, // 3: Left (West)
  { dq: 0,  dr: -1, angle: (4 * Math.PI) / 3, name: 'TL' }, // 4: Top-Left (NW)
  { dq: 1,  dr: -1, angle: (5 * Math.PI) / 3, name: 'TR' }, // 5: Top-Right (NE)
];

export const COMPASS_DIR_MAP: Record<string, number> = {
  'DIR_R': 0,
  'DIR_BR': 1,
  'DIR_BL': 2,
  'DIR_L': 3,
  'DIR_TL': 4,
  'DIR_TR': 5,
  'DIR_0': 0,
  'DIR_1': 1,
  'DIR_2': 2,
  'DIR_3': 3,
  'DIR_4': 4,
  'DIR_5': 5,
};

export function getHexDistance(q: number, r: number): number {
  return (Math.abs(q) + Math.abs(r) + Math.abs(q + r)) / 2;
}

export function isInsideGrid(q: number, r: number, maxRadius: number = HEX_RADIUS): boolean {
  return getHexDistance(q, r) <= maxRadius;
}

export function generateGrid(maxRadius: number = HEX_RADIUS): Map<string, Cell> {
  const grid = new Map<string, Cell>();
  for (let q = -maxRadius; q <= maxRadius; q++) {
    const r1 = Math.max(-maxRadius, -q - maxRadius);
    const r2 = Math.min(maxRadius, -q + maxRadius);
    for (let r = r1; r <= r2; r++) {
      const isCenter = q === 0 && r === 0;
      grid.set(cellKey(q, r), {
        q,
        r,
        enabled: false,
        isDead: isCenter,
        sound: isCenter ? 'DEAD' : 'NONE',
        modifier: 'NONE'
      });
    }
  }
  return grid;
}

export function cellKey(q: number, r: number): string {
  return `${q},${r}`;
}

export function parseKey(key: string): { q: number; r: number } {
  const [q, r] = key.split(',').map(Number);
  return { q, r };
}

// Convert axial coordinates to canvas 2D pixel coordinates (Pointy-topped)
export function hexToPixel(q: number, r: number, size: number, originX: number, originY: number): { x: number; y: number } {
  const x = size * Math.sqrt(3) * (q + r / 2) + originX;
  const y = size * (3 / 2) * r + originY;
  return { x, y };
}

// Convert screen pixel coordinates to axial hex coordinates
export function pixelToHex(x: number, y: number, size: number, originX: number, originY: number): { q: number; r: number } {
  const px = x - originX;
  const py = y - originY;
  const qFraction = (Math.sqrt(3) / 3 * px - 1 / 3 * py) / size;
  const rFraction = (2 / 3 * py) / size;
  return axialRound(qFraction, rFraction);
}

// Cube coordinate rounding algorithm
export function axialRound(qFraction: number, rFraction: number): { q: number; r: number } {
  const sFraction = -qFraction - rFraction;

  let q = Math.round(qFraction);
  let r = Math.round(rFraction);
  let s = Math.round(sFraction);

  const qDiff = Math.abs(q - qFraction);
  const rDiff = Math.abs(r - rFraction);
  const sDiff = Math.abs(s - sFraction);

  if (qDiff > rDiff && qDiff > sDiff) {
    q = -r - s;
  } else if (rDiff > sDiff) {
    r = -q - s;
  }

  return { q, r };
}

// Calculate the 6 polygon vertices of a pointy-topped hexagon
export function getHexVertices(centerX: number, centerY: number, size: number): Array<{ x: number; y: number }> {
  const points: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < 6; i++) {
    // 30, 90, 150, 210, 270, 330 degrees
    const angleRad = (Math.PI / 180) * (60 * i + 30);
    points.push({
      x: centerX + size * Math.cos(angleRad),
      y: centerY + size * Math.sin(angleRad)
    });
  }
  return points;
}

// Calculate bounce reflection when hitting the boundary or an impassable dead cell
export function calculateBounce(
  q: number,
  r: number,
  currentDir: number,
  maxRadius: number = HEX_RADIUS,
  isBlocked?: (testQ: number, testR: number) => boolean
): { nextQ: number; nextR: number; nextDir: number } {
  const isAccessible = (testQ: number, testR: number) => {
    if (!isInsideGrid(testQ, testR, maxRadius)) return false;
    if (isBlocked && isBlocked(testQ, testR)) return false;
    return true;
  };

  // Candidate step
  const offset = HEX_DIRECTIONS[currentDir];
  const candidateQ = q + offset.dq;
  const candidateR = r + offset.dr;

  if (isAccessible(candidateQ, candidateR)) {
    return { nextQ: candidateQ, nextR: candidateR, nextDir: currentDir };
  }

  // Find all valid accessible neighbor directions from (q, r)
  const validDirections: number[] = [];
  for (let d = 0; d < 6; d++) {
    const dirOffset = HEX_DIRECTIONS[d];
    if (isAccessible(q + dirOffset.dq, r + dirOffset.dr)) {
      validDirections.push(d);
    }
  }

  if (validDirections.length === 0) {
    // Trapped: stay put and reverse
    return { nextQ: q, nextR: r, nextDir: (currentDir + 3) % 6 };
  }

  // Turn candidates to bounce naturally
  const turnCandidates = [
    (currentDir + 2) % 6, // 120 deg right
    (currentDir + 4) % 6, // 120 deg left
    (currentDir + 1) % 6, // 60 deg right
    (currentDir + 5) % 6, // 60 deg left
    (currentDir + 3) % 6  // 180 deg reverse
  ];

  let chosenDir = turnCandidates.find(d => validDirections.includes(d));
  if (chosenDir === undefined) {
    chosenDir = validDirections[0];
  }

  const chosenOffset = HEX_DIRECTIONS[chosenDir];
  return {
    nextQ: q + chosenOffset.dq,
    nextR: r + chosenOffset.dr,
    nextDir: chosenDir
  };
}

export function getAccessibleDirections(
  q: number,
  r: number,
  maxRadius: number = HEX_RADIUS,
  isBlocked?: (testQ: number, testR: number) => boolean
): number[] {
  const validDirections: number[] = [];
  for (let d = 0; d < 6; d++) {
    const dirOffset = HEX_DIRECTIONS[d];
    const nq = q + dirOffset.dq;
    const nr = r + dirOffset.dr;
    if (isInsideGrid(nq, nr, maxRadius)) {
      if (!isBlocked || !isBlocked(nq, nr)) {
        validDirections.push(d);
      }
    }
  }
  return validDirections;
}
