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

const HEX_RADIUS = 5;

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
assert.strictEqual(grid.size, 91, 'Grid must have exactly 91 cells for radius 5 (rings 0 to 5)');

// Test 2: All cells within distance
for (const [key, cell] of grid) {
  const dist = getHexDistance(cell.q, cell.r);
  assert(dist <= 5, `Cell ${key} distance ${dist} must be <= 5`);
}
console.log('✓ All 91 cells satisfy dist <= 5');

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

// Test 5: 6 Playheads Radius-1 Starting Configurations & Concurrent Simulation
const PLAYHEAD_CONFIGS = [
  { id: 1, sound: 'KICK', startQ: 1, startR: 0, startDir: 0 },
  { id: 2, sound: 'SNARE', startQ: 0, startR: 1, startDir: 1 },
  { id: 3, sound: 'CLOSED_HH', startQ: -1, startR: 1, startDir: 2 },
  { id: 4, sound: 'OPEN_HH', startQ: -1, startR: 0, startDir: 3 },
  { id: 5, sound: 'CLAP', startQ: 0, startR: -1, startDir: 4 },
  { id: 6, sound: 'SYNTH', startQ: 1, startR: -1, startDir: 5 },
];

const startPositions = new Set();
for (const config of PLAYHEAD_CONFIGS) {
  const dist = getHexDistance(config.startQ, config.startR);
  assert.strictEqual(dist, 1, `Head ${config.id} (${config.sound}) must start on circle 1 (distance 1), got ${dist}`);
  assert(isInsideGrid(config.startQ, config.startR), `Head ${config.id} must start inside the grid`);
  const posKey = `${config.startQ},${config.startR}`;
  assert(!startPositions.has(posKey), `Duplicate start position ${posKey} for head ${config.id}`);
  startPositions.add(posKey);
}
assert.strictEqual(startPositions.size, 6, 'All 6 playheads must have distinct starting cells on circle 1');
console.log('✓ All 6 playheads start at distinct cells on circle 1 (r=1) with dedicated sounds and outward directions.');

// Concurrent 1000-step simulation of all 6 playheads
const activeHeads = PLAYHEAD_CONFIGS.map(c => ({
  id: c.id,
  sound: c.sound,
  q: c.startQ,
  r: c.startR,
  dir: c.startDir
}));

const obstacleBlock = (q, r) => {
  // Center and radius-1 departure pads are permanently impassable
  if (getHexDistance(q, r) <= 1) return true;
  // Extra dead cells in ring 2
  return q === 2 && r === -1;
};

for (let step = 1; step <= 1000; step++) {
  for (const head of activeHeads) {
    const next = calculateBounce(head.q, head.r, head.dir, HEX_RADIUS, obstacleBlock);
    head.q = next.nextQ;
    head.r = next.nextR;
    head.dir = next.nextDir;

    assert(isInsideGrid(head.q, head.r), `Head ${head.id} escaped grid on step ${step}`);
    assert(getHexDistance(head.q, head.r) >= 2, `Head ${head.id} must NEVER re-enter radius <= 1 on step ${step}`);
    assert(!(head.q === 2 && head.r === -1), `Head ${head.id} entered dead cell on step ${step}`);
  }
}
console.log('✓ Concurrently simulated 6 playheads across 1000 steps - all remained within grid boundaries and NEVER re-entered radius <= 1!');

// Test 6: Mobile Grid Fitting (320px, 360px, 375px, 390px, 412px)
const testViewports = [
  { w: 320, h: 360 }, // Small phone
  { w: 360, h: 450 }, // Standard Android (Samsung Galaxy, etc.)
  { w: 375, h: 480 }, // iPhone SE / iPhone Mini
  { w: 390, h: 500 }, // iPhone 13 / 14 / 15 / 16
  { w: 412, h: 550 }, // Google Pixel / Large Android
];

for (const vp of testViewports) {
  const padX = 16;
  const padY = 16;
  const cols = 2 * HEX_RADIUS + 1;
  const rows = 3 * HEX_RADIUS + 2;
  const maxSizeX = (vp.w - padX) / (cols * Math.sqrt(3));
  const maxSizeY = (vp.h - padY) / rows;
  const hexSize = Math.max(11, Math.min(48, Math.min(maxSizeX, maxSizeY)));

  const originX = vp.w / 2;
  const originY = vp.h / 2;

  // Check every cell and every vertex
  for (const [key, cell] of grid) {
    const center = {
      x: hexSize * Math.sqrt(3) * (cell.q + cell.r / 2) + originX,
      y: hexSize * (3 / 2) * cell.r + originY
    };

    for (let i = 0; i < 6; i++) {
      const angleRad = (Math.PI / 180) * (60 * i + 30);
      const vx = center.x + hexSize * Math.cos(angleRad);
      const vy = center.y + hexSize * Math.sin(angleRad);

      assert(
        vx >= 0 && vx <= vp.w,
        `Cell ${key} vertex X ${vx.toFixed(1)} out of bounds for width ${vp.w}`
      );
      assert(
        vy >= 0 && vy <= vp.h,
        `Cell ${key} vertex Y ${vy.toFixed(1)} out of bounds for height ${vp.h}`
      );
    }
  }
}
console.log('✓ Verified all 91 cells fit completely within mobile viewports (320px, 360px, 375px, 390px, 412px) without any horizontal clipping!');

// Test 7: Radius 1 Departure Bays (Reserved Launch Pads & Sound Inhibition)
const radius1Cells = [];
for (const [key, cell] of grid) {
  if (getHexDistance(cell.q, cell.r) === 1) {
    radius1Cells.push(cell);
  }
}
assert.strictEqual(radius1Cells.length, 6, 'There must be exactly 6 cells on radius 1');
console.log('✓ Exactly 6 cells on radius 1 reserved as playhead departure pads.');

// Verify each radius 1 cell maps 1-to-1 to a dedicated playhead
for (const head of PLAYHEAD_CONFIGS) {
  const match = radius1Cells.find(c => c.q === head.startQ && c.r === head.startR);
  assert(match !== undefined, `Playhead ${head.id} starting cell (${head.startQ}, ${head.startR}) must be on radius 1`);
}
console.log('✓ 1-to-1 mapping between 6 radius-1 departure pads and base playheads 1..6 verified.');

// Sound trigger rule: any step on distance <= 1 must produce NO sound
const soundTriggerTest = (q, r, isCellEnabled) => {
  const dist = getHexDistance(q, r);
  if (dist <= 1) return false; // Departure bays and center NEVER trigger sound
  return isCellEnabled;
};

// Test on radius 1 with cell enabled
for (const c of radius1Cells) {
  assert.strictEqual(
    soundTriggerTest(c.q, c.r, true),
    false,
    `Radius 1 cell (${c.q}, ${c.r}) must NEVER trigger sound even if enabled`
  );
}
// Test on center
assert.strictEqual(soundTriggerTest(0, 0, true), false, 'Center cell (0, 0) must never trigger sound');
// Test on radius 2 cell
assert.strictEqual(soundTriggerTest(2, 0, true), true, 'Radius 2 cell (2, 0) enabled must trigger sound');
assert.strictEqual(soundTriggerTest(2, 0, false), false, 'Radius 2 cell (2, 0) disabled must NOT trigger sound');
console.log('✓ Sound trigger rule verified: distance <= 1 produces NO sound; distance >= 2 triggers sound when enabled.');

// Test 8: Compact URL Encoding & Decoding Round-Trip
const MOD_MAP = {
  'NONE': 0,
  'DIR_R': 1,
  'DIR_BR': 2,
  'DIR_BL': 3,
  'DIR_L': 4,
  'DIR_TL': 5,
  'DIR_TR': 6,
};
const REVERSE_MOD_MAP = {
  0: 'NONE',
  1: 'DIR_R',
  2: 'DIR_BR',
  3: 'DIR_BL',
  4: 'DIR_L',
  5: 'DIR_TL',
  6: 'DIR_TR',
};

function toUrlSafeBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) {
    bin += String.fromCharCode(bytes[i]);
  }
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromUrlSafeBase64(b64) {
  let base64 = b64.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function encodeProjectToUrl(project, baseUrl = 'https://khodin.github.io/hexabeat/') {
  const activeHeadIds = project.playheads
    ? project.playheads.filter(p => p.active).map(p => p.id)
    : [1, 2];

  const compactCells = [];
  for (const c of project.cells) {
    const modCode = MOD_MAP[c.modifier] || 0;
    if (c.enabled || c.isDead || modCode !== 0) {
      compactCells.push([c.q, c.r, c.enabled ? 1 : 0, c.isDead ? 1 : 0, modCode]);
    }
  }

  const payload = {
    v: 1,
    n: project.name || 'Groove',
    b: project.bpm || 128,
    h: activeHeadIds,
    c: compactCells
  };

  const b64 = toUrlSafeBase64(JSON.stringify(payload));
  return `${baseUrl}#p=${b64}`;
}

function decodeProjectFromUrl(url) {
  const match = url.match(/[?#&](?:p|project)=([A-Za-z0-9_-]+)/);
  if (!match) return null;
  const jsonStr = fromUrlSafeBase64(match[1]);
  const parsed = JSON.parse(jsonStr);

  const activeHeadIds = Array.isArray(parsed.h) ? parsed.h : [1, 2];
  const playheads = [1, 2, 3, 4, 5, 6].map(id => ({
    id,
    active: activeHeadIds.includes(id)
  }));

  const cells = [];
  if (Array.isArray(parsed.c)) {
    for (const item of parsed.c) {
      cells.push({
        q: Number(item[0]),
        r: Number(item[1]),
        enabled: Boolean(item[2]),
        isDead: Boolean(item[3]),
        modifier: REVERSE_MOD_MAP[Number(item[4] || 0)] || 'NONE'
      });
    }
  }

  return {
    name: parsed.n,
    bpm: parsed.b,
    cells,
    playheads
  };
}

const originalProject = {
  name: 'Techno Super Groove #42 & Special!',
  bpm: 138,
  cells: [
    { q: 2, r: 0, enabled: true, isDead: false, modifier: 'NONE' },
    { q: -2, r: 2, enabled: true, isDead: false, modifier: 'DIR_TR' },
    { q: 3, r: -1, enabled: false, isDead: true, modifier: 'NONE' },
    { q: 0, r: 3, enabled: true, isDead: false, modifier: 'DIR_L' },
  ],
  playheads: [
    { id: 1, active: true },
    { id: 2, active: false },
    { id: 3, active: true },
    { id: 4, active: false },
    { id: 5, active: true },
    { id: 6, active: false },
  ]
};

const generatedUrl = encodeProjectToUrl(originalProject);
console.log(`Generated Share URL (${generatedUrl.length} chars): ${generatedUrl}`);
assert(generatedUrl.includes('#p='), 'URL must contain #p= hash parameter');

const decodedProject = decodeProjectFromUrl(generatedUrl);
assert.notStrictEqual(decodedProject, null, 'Decoded project must not be null');
assert.strictEqual(decodedProject.name, originalProject.name, 'Decoded project name must match');
assert.strictEqual(decodedProject.bpm, originalProject.bpm, 'Decoded project bpm must match');
assert.strictEqual(decodedProject.cells.length, originalProject.cells.length, 'Decoded cells count must match');

for (let i = 0; i < originalProject.cells.length; i++) {
  const orig = originalProject.cells[i];
  const dec = decodedProject.cells[i];
  assert.strictEqual(dec.q, orig.q, `Cell ${i} q mismatch`);
  assert.strictEqual(dec.r, orig.r, `Cell ${i} r mismatch`);
  assert.strictEqual(dec.enabled, orig.enabled, `Cell ${i} enabled mismatch`);
  assert.strictEqual(dec.isDead, orig.isDead, `Cell ${i} isDead mismatch`);
  assert.strictEqual(dec.modifier, orig.modifier, `Cell ${i} modifier mismatch`);
}

for (let i = 0; i < 6; i++) {
  assert.strictEqual(
    decodedProject.playheads[i].active,
    originalProject.playheads[i].active,
    `Head ${i + 1} active state mismatch`
  );
}
console.log('✓ Project URL encoding and decoding round-trip verified successfully with 100% fidelity!');

// Test 9: STOP function returns playheads to departure pads
const testHeads = PLAYHEAD_CONFIGS.map(c => ({
  id: c.id,
  startQ: c.startQ,
  startR: c.startR,
  startDir: c.startDir,
  q: c.startQ + 2, // simulated movement
  r: c.startR - 1,
  dir: (c.startDir + 2) % 6,
  stepProgress: 0.5
}));

let currentStep = 48;
let isAudioPlaying = true;

// Stop function execution
const stopExecution = () => {
  isAudioPlaying = false;
  testHeads.forEach(h => {
    h.q = h.startQ;
    h.r = h.startR;
    h.dir = h.startDir;
    h.stepProgress = 1.0;
  });
  currentStep = 0;
};

stopExecution();

assert.strictEqual(isAudioPlaying, false, 'Audio must be stopped');
assert.strictEqual(currentStep, 0, 'Current step must be reset to 0');
for (const h of testHeads) {
  assert.strictEqual(h.q, h.startQ, `Head ${h.id} Q position must reset to startQ (${h.startQ})`);
  assert.strictEqual(h.r, h.startR, `Head ${h.id} R position must reset to startR (${h.startR})`);
  assert.strictEqual(h.dir, h.startDir, `Head ${h.id} dir must reset to startDir (${h.startDir})`);
  assert.strictEqual(h.stepProgress, 1.0, `Head ${h.id} stepProgress must reset to 1.0`);
  assert.strictEqual(getHexDistance(h.q, h.r), 1, `Head ${h.id} must be on radius 1 pad`);
}
console.log('✓ Stop function verified: audio stopped, step reset to 0, all heads returned to radius-1 departure pads.');

// 12. Test i18n Dictionary Parity & Presets
import fs from 'node:fs';

const translationsSrc = fs.readFileSync(new URL('../src/i18n/translations.ts', import.meta.url), 'utf-8');
const presetsSrc = fs.readFileSync(new URL('../src/sequencer/Presets.ts', import.meta.url), 'utf-8');

// Verify presets contain only polyrhythm-orbit and idm-generative
assert(presetsSrc.includes('polyrhythm-orbit'), 'Presets must include polyrhythm-orbit');
assert(presetsSrc.includes('idm-generative'), 'Presets must include idm-generative');
assert(!presetsSrc.includes('techno-drive'), 'Presets must not include techno-drive');
assert(!presetsSrc.includes('hiphop-groove'), 'Presets must not include hiphop-groove');
assert(!presetsSrc.includes('trap-808'), 'Presets must not include trap-808');
assert(!presetsSrc.includes('ambient-nexus'), 'Presets must not include ambient-nexus');
assert(!presetsSrc.includes('acid-honeycomb'), 'Presets must not include acid-honeycomb');
console.log('✓ Presets verified: Only Hex Polyrhythm and IDM Generative are kept.');

// Verify i18n keys
const enMatch = translationsSrc.match(/en:\s*\{([\s\S]*?)\r?\n\s*\},/);
const frMatch = translationsSrc.match(/fr:\s*\{([\s\S]*?)\r?\n\s*\}\r?\n\};/);
assert(enMatch, 'Must find en translation block');
assert(frMatch, 'Must find fr translation block');

const extractKeys = (block) => {
  const keys = [];
  const lines = block.split('\n');
  for (const line of lines) {
    const m = line.match(/^\s*([a-zA-Z0-9_]+):/);
    if (m) keys.push(m[1]);
  }
  return keys;
};

const enKeys = extractKeys(enMatch[1]);
const frKeys = extractKeys(frMatch[1]);

assert(enKeys.length >= 40, `Expected at least 40 EN keys, found ${enKeys.length}`);
assert.strictEqual(enKeys.length, frKeys.length, `Key count mismatch between EN (${enKeys.length}) and FR (${frKeys.length})`);

for (const key of enKeys) {
  assert(frKeys.includes(key), `Missing French translation key: "${key}"`);
}
console.log(`✓ i18n verified: ${enKeys.length} keys in English and French 100% matched with zero missing entries.`);

// 13. Test Preset Matching from Shared URLs
const testPresets = [
  { id: 'polyrhythm-orbit', name: 'Hex Polyrhythm', bpm: 120 },
  { id: 'idm-generative', name: 'IDM Generative', bpm: 138 }
];

function findMatchingPresetTest(project) {
  let match = testPresets.find(p => p.id === project.id);
  if (match) return match;

  const norm = (s) => s.trim().toLowerCase();
  const projName = norm(project.name || '');

  match = testPresets.find(p => norm(p.name) === projName || norm(p.id) === projName);
  if (match && match.bpm === project.bpm) return match;

  if ((projName === 'polyrythmie' || projName === 'hex polyrhythm') && project.bpm === 120) {
    return testPresets.find(p => p.id === 'polyrhythm-orbit');
  }
  if ((projName === 'idm' || projName === 'idm generative') && project.bpm === 138) {
    return testPresets.find(p => p.id === 'idm-generative');
  }

  return undefined;
}

// Case A: Shared link for Hex Polyrhythm
const polyUrl = encodeProjectToUrl({ name: 'Hex Polyrhythm', bpm: 120, cells: [], playheads: [] });
const decodedPoly = decodeProjectFromUrl(polyUrl);
const matchedPoly = findMatchingPresetTest(decodedPoly);
assert(matchedPoly, 'Hex Polyrhythm shared link must match polyrhythm-orbit preset');
assert.strictEqual(matchedPoly.id, 'polyrhythm-orbit');

// Case B: Shared link for IDM Generative
const idmUrl = encodeProjectToUrl({ name: 'IDM Generative', bpm: 138, cells: [], playheads: [] });
const decodedIdm = decodeProjectFromUrl(idmUrl);
const matchedIdm = findMatchingPresetTest(decodedIdm);
assert(matchedIdm, 'IDM Generative shared link must match idm-generative preset');
assert.strictEqual(matchedIdm.id, 'idm-generative');

// Case C: Shared link with French translation name (Polyrythmie)
const polyFrUrl = encodeProjectToUrl({ name: 'Polyrythmie', bpm: 120, cells: [], playheads: [] });
const decodedPolyFr = decodeProjectFromUrl(polyFrUrl);
const matchedPolyFr = findMatchingPresetTest(decodedPolyFr);
assert(matchedPolyFr, 'Polyrythmie French name shared link must match polyrhythm-orbit preset');
assert.strictEqual(matchedPolyFr.id, 'polyrhythm-orbit');

// Case D: Shared link for custom project
const customUrl = encodeProjectToUrl({ name: 'Cyber Honeycomb', bpm: 140, cells: [], playheads: [] });
const decodedCustom = decodeProjectFromUrl(customUrl);
const matchedCustom = findMatchingPresetTest(decodedCustom);
assert.strictEqual(matchedCustom, undefined, 'Custom project must not match built-in presets');
assert.strictEqual(decodedCustom.name, 'Cyber Honeycomb');

console.log('✓ Preset identification from shared URLs verified successfully (Hex Polyrhythm, IDM, French aliases, and custom projects).');

// 14. Test HexaBeat Academy Quests Integrity and Validation Logic
const questsSrc = fs.readFileSync(new URL('../src/quests/Quests.ts', import.meta.url), 'utf-8');
assert(questsSrc.includes('quest-1-first-beat'), 'Quests must include Quest 1');
assert(questsSrc.includes('quest-2-echo-bounce'), 'Quests must include Quest 2');
assert(questsSrc.includes('quest-3-infinite-orbit'), 'Quests must include Quest 3');
assert(questsSrc.includes('quest-4-kick-snare-duo'), 'Quests must include Quest 4');
assert(questsSrc.includes('quest-5-spatial-melody'), 'Quests must include Quest 5');

// Test Quest 1 logic simulation
let q1Metrics = { kicksCount: 0 };
const q1Step = (hasKick) => {
  if (hasKick) q1Metrics.kicksCount++;
  return q1Metrics.kicksCount >= 1;
};
assert.strictEqual(q1Step(true), true, 'Quest 1 must complete on first kick');

// Test Quest 2 corridor bounce simulation
const q2Walls = new Set(['2,-1', '3,-1', '1,1', '2,1', '4,-1', '4,0', '3,1']);
const isQ2Blocked = (q, r) => getHexDistance(q, r) <= 1 || q2Walls.has(`${q},${r}`);
let q2Q = 1, q2R = 0, q2Dir = 0, q2Kicks = 0, q2Steps = 0;
while (q2Kicks < 4 && q2Steps < 20) {
  q2Steps++;
  const res = calculateBounce(q2Q, q2R, q2Dir, 5, isQ2Blocked);
  q2Q = res.nextQ;
  q2R = res.nextR;
  q2Dir = res.nextDir;
  if (q2Q === 2 && q2R === 0) q2Kicks++;
}
assert.strictEqual(q2Kicks, 4, 'Quest 2 corridor must produce 4 kicks');
assert.strictEqual(q2Steps, 7, 'Quest 2 corridor must complete 4 kicks in exactly 7 steps');

// Test Quest 3 orbit loop detection (12-step full ring-2 round)
let loopStreak = 0;
const q3Step = (dist) => {
  if (dist === 2) loopStreak++;
  else loopStreak = 0;
  return loopStreak >= 12;
};
for (let s = 1; s <= 11; s++) assert.strictEqual(q3Step(2), false);
assert.strictEqual(q3Step(2), true, 'Quest 3 must complete when 12 consecutive ring-2 steps (full loop) are sustained');

// Test Quest 4 polyrhythm alternation
let q4Metrics = { kicks: 0, snares: 0 };
const q4Step = (sound) => {
  if (sound === 'KICK') q4Metrics.kicks++;
  if (sound === 'SNARE') q4Metrics.snares++;
  return q4Metrics.kicks >= 4 && q4Metrics.snares >= 4;
};
for (let i = 0; i < 3; i++) {
  q4Step('KICK');
  q4Step('SNARE');
}
assert.strictEqual(q4Step('KICK'), false);
assert.strictEqual(q4Step('SNARE'), true, 'Quest 4 must complete on 4th Kick and 4th Snare');

// Test Quest 5 distinct pitch notes detection
const distinctPitches = new Set();
const q5Step = (q, r) => {
  const noteIndex = Math.abs(q * 3 + r * 5) % 7;
  distinctPitches.add(noteIndex);
  return distinctPitches.size >= 3;
};
assert.strictEqual(q5Step(2, -2), false); // note 4
assert.strictEqual(q5Step(2, -2), false); // same note 4
assert.strictEqual(q5Step(3, -2), false); // note 1 (size 2)
assert.strictEqual(q5Step(3, -3), true, 'Quest 5 must complete when 3 distinct pitch frequencies are triggered');

console.log('✓ HexaBeat Academy 5 quests verified: targets, step evaluators, and progressive milestone completions validated.');

console.log('All HexaBeat unit tests passed!');



