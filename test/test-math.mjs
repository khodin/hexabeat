import assert from 'node:assert';

// 6 axial directions in pointy-topped orientation
const HEX_DIRECTIONS = [
  { dq: 1,  dr: 0,  angle: 0,                 name: 'E'  }, // 0
  { dq: 0,  dr: 1,  angle: Math.PI / 3,       name: 'SE' }, // 1
  { dq: -1, dr: 1,  angle: (2 * Math.PI) / 3, name: 'SW' }, // 2
  { dq: -1, dr: 0,  angle: Math.PI,           name: 'W'  }, // 3
  { dq: 0,  dr: -1, angle: (4 * Math.PI) / 3, name: 'NW' }, // 4
  { dq: 1,  dr: -1, angle: (5 * Math.PI) / 3, name: 'NE' }, // 5
];

const HEX_RADIUS = 3;

function getHexDistance(q, r) {
  return (Math.abs(q) + Math.abs(r) + Math.abs(q + r)) / 2;
}

function isInsideGrid(q, r, maxRadius = HEX_RADIUS) {
  return getHexDistance(q, r) <= maxRadius;
}

function generateGrid(maxRadius = HEX_RADIUS) {
  const grid = new Map();
  for (let q = -maxRadius; q <= maxRadius; q++) {
    const r1 = Math.max(-maxRadius, -q - maxRadius);
    const r2 = Math.min(maxRadius, -q + maxRadius);
    for (let r = r1; r <= r2; r++) {
      grid.set(`${q},${r}`, { q, r });
    }
  }
  return grid;
}

function calculateBounce(q, r, currentDir, maxRadius = HEX_RADIUS, isBlocked) {
  const isAccessible = (testQ, testR) => {
    if (!isInsideGrid(testQ, testR, maxRadius)) return false;
    if (isBlocked && isBlocked(testQ, testR)) return false;
    return true;
  };

  const offset = HEX_DIRECTIONS[currentDir];
  const candidateQ = q + offset.dq;
  const candidateR = r + offset.dr;

  if (isAccessible(candidateQ, candidateR)) {
    return { nextQ: candidateQ, nextR: candidateR, nextDir: currentDir };
  }

  const validDirections = [];
  for (let d = 0; d < 6; d++) {
    const dirOffset = HEX_DIRECTIONS[d];
    if (isAccessible(q + dirOffset.dq, r + dirOffset.dr)) {
      validDirections.push(d);
    }
  }

  if (validDirections.length === 0) {
    return { nextQ: q, nextR: r, nextDir: (currentDir + 3) % 6 };
  }

  const turnCandidates = [
    (currentDir + 2) % 6,
    (currentDir + 4) % 6,
    (currentDir + 1) % 6,
    (currentDir + 5) % 6,
    (currentDir + 3) % 6
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

console.log('--- Testing Hex Math & Grid Logic ---');

// Test 1: Grid size
const grid = generateGrid();
console.log(`Generated grid cell count: ${grid.size}`);
assert.strictEqual(grid.size, 37, 'Grid must have exactly 37 cells for radius 3 (rings 0, 1, 2, 3)');

// Test 2: All cells within distance
for (const [key, cell] of grid) {
  const dist = getHexDistance(cell.q, cell.r);
  assert(dist <= 3, `Cell ${key} distance ${dist} must be <= 3`);
}
console.log('✓ All 37 cells satisfy dist <= 3');

// Test 3: Boundary bounce
let bounceTestsCount = 0;
for (const [key, cell] of grid) {
  for (let dir = 0; dir < 6; dir++) {
    const result = calculateBounce(cell.q, cell.r, dir);
    assert(
      isInsideGrid(result.nextQ, result.nextR),
      `Bounce from ${key} dir ${dir} ended out of bounds at (${result.nextQ}, ${result.nextR})`
    );
    bounceTestsCount++;
  }
}
console.log(`✓ Tested ${bounceTestsCount} boundary movements - all bounced correctly inside the grid.`);

// Test 4: Dead Cells and Center Obstacle Avoidance
const deadCells = new Set(['1,0', '-1,1', '0,-2']);
const isBlocked = (q, r) => {
  // Center is blocked once started
  if (q === 0 && r === 0) return true;
  return deadCells.has(`${q},${r}`);
};

// Simulation starting from (0, 0)
let simQ = 0;
let simR = 0;
let simDir = 0;

// First step from center outward
const step1 = calculateBounce(simQ, simR, simDir, 3, (q, r) => deadCells.has(`${q},${r}`));
simQ = step1.nextQ;
simR = step1.nextR;
simDir = step1.nextDir;
assert(simQ !== 0 || simR !== 0, 'Playhead must leave center on step 1');

for (let step = 2; step <= 1000; step++) {
  const result = calculateBounce(simQ, simR, simDir, 3, isBlocked);
  simQ = result.nextQ;
  simR = result.nextR;
  simDir = result.nextDir;

  assert(isInsideGrid(simQ, simR), `Playhead escaped grid on step ${step} at (${simQ}, ${simR})`);
  assert(simQ !== 0 || simR !== 0, `Playhead must NEVER re-enter center cell on step ${step}`);
  assert(!deadCells.has(`${simQ},${simR}`), `Playhead must NEVER step into dead cell on step ${step}`);
}
console.log('✓ Simulated 1000 steps with dead cells and locked center - playhead never entered any dead cell or center cell!');

console.log('All HexaBeat unit tests passed!');
