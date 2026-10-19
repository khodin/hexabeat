import { Sequencer } from '../sequencer/Sequencer';
import { Cell, Playhead, SoundType, ModifierType } from '../grid/HexTypes';
import {
  hexToPixel,
  pixelToHex,
  getHexVertices,
  isInsideGrid,
  HEX_DIRECTIONS,
  COMPASS_DIR_MAP,
  HEX_RADIUS
} from '../grid/HexMath';

export interface SoundStyle {
  label: string;
  fill: string;
  border: string;
  glow: string;
  text: string;
}

export const SOUND_STYLES: Record<SoundType, SoundStyle> = {
  NONE: {
    label: '',
    fill: 'rgba(26, 26, 40, 0.75)',
    border: 'rgba(50, 50, 75, 0.7)',
    glow: 'rgba(0, 0, 0, 0)',
    text: '#555577'
  },
  KICK: {
    label: 'BD',
    fill: 'rgba(235, 45, 60, 0.85)',
    border: '#ff4d5a',
    glow: 'rgba(255, 50, 70, 0.65)',
    text: '#ffffff'
  },
  SNARE: {
    label: 'SD',
    fill: 'rgba(0, 195, 230, 0.85)',
    border: '#33dfff',
    glow: 'rgba(0, 220, 255, 0.65)',
    text: '#ffffff'
  },
  CLOSED_HH: {
    label: 'CH',
    fill: 'rgba(245, 190, 20, 0.85)',
    border: '#ffdd33',
    glow: 'rgba(255, 210, 30, 0.65)',
    text: '#111111'
  },
  OPEN_HH: {
    label: 'OH',
    fill: 'rgba(250, 120, 10, 0.85)',
    border: '#ff9533',
    glow: 'rgba(255, 140, 20, 0.65)',
    text: '#ffffff'
  },
  CLAP: {
    label: 'CP',
    fill: 'rgba(225, 30, 150, 0.85)',
    border: '#ff4dc4',
    glow: 'rgba(240, 40, 160, 0.65)',
    text: '#ffffff'
  },
  SYNTH: {
    label: 'SY',
    fill: 'rgba(140, 50, 240, 0.85)',
    border: '#b166ff',
    glow: 'rgba(160, 70, 255, 0.65)',
    text: '#ffffff'
  },
  DEAD: {
    label: 'WALL',
    fill: 'rgba(25, 14, 18, 0.95)',
    border: '#ff3344',
    glow: 'rgba(255, 51, 68, 0.55)',
    text: '#ff4455'
  }
};

export type CellActionType = 'TAP' | 'ROUTE' | 'WALL';

export type CellActionHandler = (
  action: CellActionType,
  q: number,
  r: number,
  dirIndex?: number,
  cell?: Cell
) => void;

export class HexCanvas {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private hexSize: number = 38;
  private originX: number = 0;
  private originY: number = 0;
  private selectedCellKey: string | null = null;
  private animationFrameId: number | null = null;

  private onCellAction: CellActionHandler | null = null;
  private isPointerDown: boolean = false;
  private pointerDownX: number = 0;
  private pointerDownY: number = 0;
  private pointerDownHex: { q: number; r: number } | null = null;
  private longPressTimer: any = null;
  private isLongPressTriggered: boolean = false;
  private activeDrag: {
    q: number;
    r: number;
    currentX: number;
    currentY: number;
    dirIndex: number;
  } | null = null;

  constructor(canvas: HTMLCanvasElement, private sequencer: Sequencer) {
    this.canvas = canvas;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('Could not get Canvas 2D context');
    this.ctx = context;

    this.initEvents();
    this.resize();
    window.addEventListener('resize', () => this.resize());
    if (typeof ResizeObserver !== 'undefined' && this.canvas.parentElement) {
      const ro = new ResizeObserver(() => this.resize());
      ro.observe(this.canvas.parentElement);
    }
    this.startRenderLoop();
  }

  public setOnCellAction(cb: CellActionHandler) {
    this.onCellAction = cb;
  }

  public setSelectedCell(q: number, r: number) {
    this.selectedCellKey = `${q},${r}`;
  }

  public getSelectedCellKey(): string | null {
    return this.selectedCellKey;
  }

  public resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.resetTransform();
    this.ctx.scale(dpr, dpr);

    this.originX = rect.width / 2;
    this.originY = rect.height / 2;

    // The hexagonal grid of radius HEX_RADIUS in pointy-topped orientation spans:
    // Total horizontal span = (2 * HEX_RADIUS + 1) * sqrt(3) * hexSize
    // Total vertical span = (3 * HEX_RADIUS + 2) * hexSize
    // Safe margins: padX = 16px, padY = 16px to ensure all outer rings fit comfortably on mobile
    const padX = 16;
    const padY = 16;
    const maxAvailableWidth = Math.max(10, rect.width - padX);
    const maxAvailableHeight = Math.max(10, rect.height - padY);

    const cols = 2 * HEX_RADIUS + 1;
    const rows = 3 * HEX_RADIUS + 2;
    const maxSizeX = maxAvailableWidth / (cols * Math.sqrt(3));
    const maxSizeY = maxAvailableHeight / rows;

    // Choose the dimension that guarantees both horizontal and vertical fitting
    this.hexSize = Math.max(11, Math.min(52, Math.min(maxSizeX, maxSizeY)));
  }

  private initEvents() {
    this.canvas.addEventListener('pointerdown', (e: PointerEvent) => {
      this.isPointerDown = true;
      try {
        this.canvas.setPointerCapture(e.pointerId);
      } catch {}

      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const { q, r } = pixelToHex(x, y, this.hexSize, this.originX, this.originY);
      if (!isInsideGrid(q, r)) {
        this.pointerDownHex = null;
        return;
      }

      this.pointerDownX = x;
      this.pointerDownY = y;
      this.pointerDownHex = { q, r };
      this.selectedCellKey = `${q},${r}`;
      this.isLongPressTriggered = false;
      this.activeDrag = null;

      // Start long-press timer for Dead Wall toggle
      const isDeparture = this.sequencer.isDepartureCell(q, r);
      const isCenter = q === 0 && r === 0;

      if (!isDeparture && !isCenter) {
        this.longPressTimer = setTimeout(() => {
          this.isLongPressTriggered = true;
          this.activeDrag = null;
          if (navigator.vibrate) {
            try { navigator.vibrate(30); } catch {}
          }
          const cell = this.sequencer.getCell(q, r);
          this.onCellAction?.('WALL', q, r, undefined, cell);
        }, 420);
      }
    });

    this.canvas.addEventListener('pointermove', (e: PointerEvent) => {
      if (!this.isPointerDown || !this.pointerDownHex) return;

      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const dx = x - this.pointerDownX;
      const dy = y - this.pointerDownY;
      const dist = Math.hypot(dx, dy);

      // If moved past threshold, cancel long-press and start route swipe
      if (dist >= 14) {
        if (this.longPressTimer) {
          clearTimeout(this.longPressTimer);
          this.longPressTimer = null;
        }

        if (this.isLongPressTriggered) return;

        // Departure pads and center core cannot be routed
        const { q, r } = this.pointerDownHex;
        if (this.sequencer.isDepartureCell(q, r) || (q === 0 && r === 0)) return;

        const angle = Math.atan2(dy, dx);
        const normAngle = (angle + 2 * Math.PI) % (2 * Math.PI);
        const dirIndex = Math.floor(((normAngle + Math.PI / 6) % (2 * Math.PI)) / (Math.PI / 3)) % 6;

        this.activeDrag = {
          q,
          r,
          currentX: x,
          currentY: y,
          dirIndex
        };
      }
    });

    const pointerUp = (e: PointerEvent) => {
      if (!this.isPointerDown) return;
      this.isPointerDown = false;

      if (this.longPressTimer) {
        clearTimeout(this.longPressTimer);
        this.longPressTimer = null;
      }

      try {
        this.canvas.releasePointerCapture(e.pointerId);
      } catch {}

      if (this.pointerDownHex) {
        const { q, r } = this.pointerDownHex;
        const cell = this.sequencer.getCell(q, r);

        if (this.isLongPressTriggered) {
          // Handled by long press timer
        } else if (this.activeDrag && Math.hypot(this.activeDrag.currentX - this.pointerDownX, this.activeDrag.currentY - this.pointerDownY) >= 14) {
          // Swipe to route!
          if (navigator.vibrate) {
            try { navigator.vibrate(15); } catch {}
          }
          this.onCellAction?.('ROUTE', q, r, this.activeDrag.dirIndex, cell);
        } else {
          // Quick tap!
          this.onCellAction?.('TAP', q, r, undefined, cell);
        }
      }

      this.activeDrag = null;
      this.pointerDownHex = null;
      this.isLongPressTriggered = false;
    };

    this.canvas.addEventListener('pointerup', pointerUp);
    this.canvas.addEventListener('pointercancel', pointerUp);
  }

  public startRenderLoop() {
    const render = () => {
      this.render();
      this.animationFrameId = requestAnimationFrame(render);
    };
    render();
  }

  public stopRenderLoop() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private render() {
    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const now = performance.now();

    // 1. Dark futuristic background
    const bgGradient = this.ctx.createRadialGradient(
      this.originX, this.originY, 20,
      this.originX, this.originY, Math.max(width, height) / 1.4
    );
    bgGradient.addColorStop(0, '#10101b');
    bgGradient.addColorStop(0.6, '#0a0a12');
    bgGradient.addColorStop(1, '#050508');

    this.ctx.fillStyle = bgGradient;
    this.ctx.fillRect(0, 0, width, height);

    // 2. Draw subtle grid connection web
    this.drawHexWeb();

    // 3. Render Hexagonal Cells
    const grid = this.sequencer.getGrid();
    grid.forEach((cell) => {
      this.drawCell(cell, now);
    });

    // 4. Render Active Playheads
    const playheads = this.sequencer.getPlayheads();
    playheads.forEach((p) => {
      if (p.active) {
        this.drawPlayhead(p);
      }
    });

    // 5. Render Active Swipe Drag Vector Guide
    if (this.activeDrag) {
      this.drawDragVector(this.activeDrag);
    }
  }

  private drawDragVector(drag: { q: number; r: number; currentX: number; currentY: number; dirIndex: number }) {
    const origin = hexToPixel(drag.q, drag.r, this.hexSize, this.originX, this.originY);
    const angle = HEX_DIRECTIONS[drag.dirIndex].angle;
    const facetDist = (this.hexSize - 2) * (Math.sqrt(3) / 2);

    this.ctx.save();

    // Glowing trajectory beam from cell origin to touch point
    this.ctx.beginPath();
    this.ctx.moveTo(origin.x, origin.y);
    this.ctx.lineTo(drag.currentX, drag.currentY);
    this.ctx.strokeStyle = '#00ffff';
    this.ctx.lineWidth = 2.5;
    this.ctx.shadowColor = 'rgba(0, 255, 255, 0.85)';
    this.ctx.shadowBlur = 12;
    this.ctx.stroke();

    // Touch pip indicator
    this.ctx.beginPath();
    this.ctx.arc(drag.currentX, drag.currentY, 6, 0, Math.PI * 2);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = '#00ffff';
    this.ctx.fill();

    // Live illuminated facet gate preview on target wall
    this.ctx.translate(origin.x, origin.y);
    this.ctx.rotate(angle);
    const halfEdge = (this.hexSize - 2) * 0.5;
    this.ctx.beginPath();
    this.ctx.moveTo(facetDist, -halfEdge * 0.65);
    this.ctx.lineTo(facetDist, halfEdge * 0.65);
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 4;
    this.ctx.shadowColor = '#00ffff';
    this.ctx.shadowBlur = 15;
    this.ctx.stroke();

    this.ctx.restore();
  }

  private drawHexWeb() {
    this.ctx.save();
    this.ctx.strokeStyle = 'rgba(40, 45, 65, 0.35)';
    this.ctx.lineWidth = 1;

    const grid = this.sequencer.getGrid();
    grid.forEach((cell) => {
      const p1 = hexToPixel(cell.q, cell.r, this.hexSize, this.originX, this.originY);
      // Connect to East and SE neighbors
      [0, 1].forEach((dir) => {
        const offset = HEX_DIRECTIONS[dir];
        const nq = cell.q + offset.dq;
        const nr = cell.r + offset.dr;
        if (isInsideGrid(nq, nr)) {
          const p2 = hexToPixel(nq, nr, this.hexSize, this.originX, this.originY);
          this.ctx.beginPath();
          this.ctx.moveTo(p1.x, p1.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.stroke();
        }
      });
    });
    this.ctx.restore();
  }

  private drawCell(cell: Cell, now: number) {
    const { x, y } = hexToPixel(cell.q, cell.r, this.hexSize, this.originX, this.originY);
    const isCenter = cell.q === 0 && cell.r === 0;
    const isDeparture = this.sequencer.isDepartureCell(cell.q, cell.r);
    const departureHead = isDeparture ? this.sequencer.getDeparturePlayhead(cell.q, cell.r) : undefined;
    const isDead = isCenter || cell.isDead || cell.sound === 'DEAD';
    const isEnabled = !isDeparture && !isDead && (cell.enabled || (cell.sound !== 'NONE' && cell.sound !== 'DEAD'));
    const key = `${cell.q},${cell.r}`;
    const isSelected = this.selectedCellKey === key;

    // Check hit trigger intensity decay (over 300ms)
    let triggerFactor = 0;
    if (cell.lastTriggerTime) {
      const elapsed = now - cell.lastTriggerTime;
      if (elapsed < 320) {
        triggerFactor = Math.pow(1 - elapsed / 320, 2);
      }
    }

    const vertices = getHexVertices(x, y, this.hexSize - 2);

    this.ctx.save();

    // Hexagon Path
    this.ctx.beginPath();
    vertices.forEach((pt, idx) => {
      if (idx === 0) this.ctx.moveTo(pt.x, pt.y);
      else this.ctx.lineTo(pt.x, pt.y);
    });
    this.ctx.closePath();

    if (isDead) {
      this.ctx.fillStyle = SOUND_STYLES.DEAD.fill;
      this.ctx.strokeStyle = isSelected ? '#ffffff' : SOUND_STYLES.DEAD.border;
      this.ctx.lineWidth = isSelected ? 3 : 1.5;
      this.ctx.shadowColor = SOUND_STYLES.DEAD.glow;
      this.ctx.shadowBlur = 8;
    } else if (isDeparture && departureHead) {
      // Dedicated Departure Launch Bay for Playhead 1..6
      if (departureHead.active) {
        this.ctx.fillStyle = 'rgba(16, 20, 32, 0.9)';
        this.ctx.strokeStyle = isSelected ? '#ffffff' : departureHead.color;
        this.ctx.shadowColor = departureHead.glowColor;
        this.ctx.shadowBlur = 12;
        this.ctx.lineWidth = isSelected ? 3 : 2;
      } else {
        this.ctx.fillStyle = 'rgba(12, 13, 20, 0.85)';
        this.ctx.strokeStyle = isSelected ? '#ffffff' : 'rgba(55, 60, 80, 0.7)';
        this.ctx.lineWidth = isSelected ? 2.5 : 1.2;
        this.ctx.shadowBlur = 0;
      }
    } else if (isEnabled) {
      if (triggerFactor > 0) {
        const trigColor = cell.lastTriggerColor || '#ffffff';
        this.ctx.fillStyle = `rgba(255, 255, 255, ${0.4 + 0.5 * triggerFactor})`;
        this.ctx.strokeStyle = trigColor;
        this.ctx.shadowColor = trigColor;
        this.ctx.shadowBlur = 24 * triggerFactor;
        this.ctx.lineWidth = 2.5;
      } else {
        this.ctx.fillStyle = 'rgba(0, 229, 255, 0.12)';
        this.ctx.strokeStyle = isSelected ? '#ffffff' : 'rgba(0, 229, 255, 0.7)';
        this.ctx.shadowColor = 'rgba(0, 229, 255, 0.4)';
        this.ctx.shadowBlur = 10;
        this.ctx.lineWidth = isSelected ? 3 : 1.8;
      }
    } else {
      // Disabled / Silent cell
      this.ctx.fillStyle = 'rgba(16, 17, 28, 0.7)';
      this.ctx.strokeStyle = isSelected ? '#ffffff' : 'rgba(40, 45, 68, 0.6)';
      this.ctx.lineWidth = isSelected ? 2.5 : 1.2;
      this.ctx.shadowBlur = 0;
    }

    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.restore();

    // Trigger Shockwave ripple
    if (triggerFactor > 0) {
      this.ctx.save();
      const rippleSize = (this.hexSize - 2) * (1 + 0.6 * (1 - triggerFactor));
      const rippleVertices = getHexVertices(x, y, rippleSize);
      this.ctx.beginPath();
      rippleVertices.forEach((pt, idx) => {
        if (idx === 0) this.ctx.moveTo(pt.x, pt.y);
        else this.ctx.lineTo(pt.x, pt.y);
      });
      this.ctx.closePath();
      const trigColor = cell.lastTriggerColor || '#ffffff';
      this.ctx.strokeStyle = trigColor;
      this.ctx.globalAlpha = 0.8 * triggerFactor;
      this.ctx.lineWidth = 2.2 * triggerFactor;
      this.ctx.stroke();
      this.ctx.restore();
    }

    // Inner Labels & Modifier Glyphs / Departure Pad Badge
    this.drawCellContent(x, y, cell, isDead, isEnabled, departureHead);
  }

  private drawCellContent(x: number, y: number, cell: Cell, isDead: boolean, isEnabled: boolean, departureHead?: Playhead) {
    if (isDead) {
      // Color alone represents dead cells; no cross or DEAD wording
      return;
    }

    if (departureHead) {
      // Draw Departure Bay tactile console button
      this.ctx.save();
      const padRadius = Math.max(7, Math.min(15, this.hexSize * 0.48));
      const soundAbbrMap: Record<number, string> = {
        1: 'BD',
        2: 'SD',
        3: 'CH',
        4: 'OH',
        5: 'CP',
        6: 'SY'
      };
      const soundLabel = soundAbbrMap[departureHead.id] || '';

      // Outer Bezel / Button Ring
      this.ctx.beginPath();
      this.ctx.arc(x, y, padRadius, 0, Math.PI * 2);
      if (departureHead.active) {
        this.ctx.fillStyle = 'rgba(18, 24, 40, 0.95)';
        this.ctx.strokeStyle = departureHead.color;
        this.ctx.lineWidth = Math.max(1.8, this.hexSize * 0.08);
        this.ctx.shadowColor = departureHead.glowColor;
        this.ctx.shadowBlur = 8;
      } else {
        this.ctx.fillStyle = 'rgba(12, 13, 20, 0.9)';
        this.ctx.strokeStyle = 'rgba(65, 70, 95, 0.55)';
        this.ctx.lineWidth = 1.2;
        this.ctx.shadowBlur = 0;
      }
      this.ctx.fill();
      this.ctx.stroke();

      // Power status LED indicator dot on active button
      if (departureHead.active) {
        this.ctx.beginPath();
        this.ctx.arc(x, y - padRadius * 0.56, Math.max(1.4, padRadius * 0.16), 0, Math.PI * 2);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.shadowColor = departureHead.color;
        this.ctx.shadowBlur = 6;
        this.ctx.fill();
      }

      // Head number in center
      const fontSize = Math.max(8, Math.round(padRadius * (this.hexSize >= 22 ? 0.72 : 0.9)));
      this.ctx.font = `bold ${fontSize}px sans-serif`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillStyle = departureHead.active ? '#ffffff' : '#555b75';
      this.ctx.shadowBlur = departureHead.active ? 4 : 0;
      this.ctx.shadowColor = departureHead.color;
      const numY = (this.hexSize >= 22 && departureHead.active) ? y - 1 : y;
      this.ctx.fillText(`${departureHead.id}`, x, numY);

      // Sound abbreviation (BD, SD, CH, OH, CP, SY) below number on medium/large screens
      if (this.hexSize >= 22 && soundLabel) {
        const lblSize = Math.max(6, Math.round(padRadius * 0.42));
        this.ctx.font = `700 ${lblSize}px sans-serif`;
        this.ctx.fillStyle = departureHead.active ? departureHead.color : '#4d536d';
        this.ctx.shadowBlur = 0;
        this.ctx.fillText(soundLabel, x, y + padRadius * 0.54);
      }

      this.ctx.restore();
      return;
    }

    // Color alone represents enabled cells; no dot or spark
    if (cell.modifier !== 'NONE') {
      this.drawModifierGlyph(x, y, cell.modifier, isEnabled);
    }
  }

  private drawModifierGlyph(x: number, y: number, modifier: ModifierType, hasSound: boolean) {
    if (modifier === 'NONE') return;

    if (modifier in COMPASS_DIR_MAP) {
      const dirIndex = COMPASS_DIR_MAP[modifier];
      const angle = HEX_DIRECTIONS[dirIndex].angle;

      // Distance from hex center to the facet midpoint
      const facetDist = (this.hexSize - 2) * (Math.sqrt(3) / 2);
      const color = hasSound ? '#ffffff' : '#00ffff';
      const glowColor = hasSound ? 'rgba(255, 255, 255, 0.75)' : 'rgba(0, 255, 255, 0.75)';

      this.ctx.save();
      this.ctx.translate(x, y);
      this.ctx.rotate(angle);

      // 1. Prominent sci-fi stealth chevron / dart
      // Reaches 78% out toward the target facet
      const tipX = facetDist * 0.78;
      const tailX = -facetDist * 0.42;
      const wingY = facetDist * 0.52;
      const notchX = tailX + facetDist * 0.28;

      this.ctx.beginPath();
      this.ctx.moveTo(tipX, 0);
      this.ctx.lineTo(tailX, -wingY);
      this.ctx.lineTo(notchX, 0);
      this.ctx.lineTo(tailX, wingY);
      this.ctx.closePath();

      this.ctx.fillStyle = hasSound ? 'rgba(255, 255, 255, 0.88)' : 'rgba(0, 229, 255, 0.85)';
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = Math.max(1.2, this.hexSize * 0.055);
      this.ctx.shadowColor = glowColor;
      this.ctx.shadowBlur = Math.min(10, this.hexSize * 0.45);
      this.ctx.fill();
      this.ctx.stroke();

      // 2. Glowing Exit Gate Accent on the target perimeter facet
      // Target facet in rotated frame is vertical line at x = facetDist
      const halfEdge = (this.hexSize - 2) * 0.5;
      this.ctx.beginPath();
      this.ctx.moveTo(facetDist, -halfEdge * 0.55);
      this.ctx.lineTo(facetDist, halfEdge * 0.55);
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = Math.max(2.5, this.hexSize * 0.12);
      this.ctx.shadowColor = glowColor;
      this.ctx.shadowBlur = Math.min(12, this.hexSize * 0.5);
      this.ctx.stroke();

      this.ctx.restore();
    }
  }

  private drawPlayhead(p: Playhead) {
    // Smooth interpolation between previous hex position and current hex
    const pCurrent = hexToPixel(p.q, p.r, this.hexSize, this.originX, this.originY);
    const pPrev = hexToPixel(p.prevQ, p.prevR, this.hexSize, this.originX, this.originY);

    // Advance stepProgress smoothly toward 1.0
    p.stepProgress = Math.min(1.0, p.stepProgress + 0.16);
    // Smooth cubic ease out
    const t = 1 - Math.pow(1 - p.stepProgress, 3);

    const x = pPrev.x + (pCurrent.x - pPrev.x) * t;
    const y = pPrev.y + (pCurrent.y - pPrev.y) * t;

    this.ctx.save();

    const haloRadius = Math.max(7, Math.min(13, this.hexSize * 0.36));
    const coreRadius = Math.max(4.5, Math.min(8, haloRadius * 0.62));
    const fontSize = Math.max(7, Math.round(coreRadius * 1.15));

    // Outer Neon Glow
    this.ctx.shadowColor = p.glowColor;
    this.ctx.shadowBlur = Math.min(18, haloRadius * 1.4);

    // Glowing halo
    this.ctx.beginPath();
    this.ctx.arc(x, y, haloRadius, 0, Math.PI * 2);
    this.ctx.fillStyle = p.color;
    this.ctx.fill();

    // Inner bright core
    this.ctx.shadowBlur = 0;
    this.ctx.beginPath();
    this.ctx.arc(x, y, coreRadius, 0, Math.PI * 2);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fill();

    // Playhead ID text
    this.ctx.fillStyle = '#0a0a14';
    this.ctx.font = `bold ${fontSize}px sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(`${p.id}`, x, y);

    this.ctx.restore();
  }
}


