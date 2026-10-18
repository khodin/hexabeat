import { Sequencer } from '../sequencer/Sequencer';
import { Cell, Playhead, SoundType, ModifierType } from '../grid/HexTypes';
import {
  hexToPixel,
  pixelToHex,
  getHexVertices,
  isInsideGrid,
  HEX_DIRECTIONS,
  COMPASS_DIR_MAP
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

export type CellSelectHandler = (q: number, r: number, cell?: Cell) => void;

export class HexCanvas {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private hexSize: number = 38;
  private originX: number = 0;
  private originY: number = 0;
  private selectedCellKey: string | null = null;
  private animationFrameId: number | null = null;

  private onCellSelect: CellSelectHandler | null = null;
  private isPointerDown: boolean = false;
  private lastTouchedKey: string | null = null;

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

  public setOnCellSelect(cb: CellSelectHandler) {
    this.onCellSelect = cb;
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

    // The 37-cell hexagonal grid (radius 3) in pointy-topped orientation spans:
    // Total horizontal span = 7 * sqrt(3) * hexSize ≈ 12.12436 * hexSize
    // Total vertical span = 11 * hexSize
    // Safe margins: padX = 16px, padY = 16px to ensure all outer rings fit comfortably on mobile
    const padX = 16;
    const padY = 16;
    const maxAvailableWidth = Math.max(10, rect.width - padX);
    const maxAvailableHeight = Math.max(10, rect.height - padY);

    const maxSizeX = maxAvailableWidth / (7 * Math.sqrt(3));
    const maxSizeY = maxAvailableHeight / 11;

    // Choose the dimension that guarantees both horizontal and vertical fitting
    this.hexSize = Math.max(14, Math.min(48, Math.min(maxSizeX, maxSizeY)));
  }

  private initEvents() {
    const handlePointerAction = (e: PointerEvent, isDrag: boolean) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const { q, r } = pixelToHex(x, y, this.hexSize, this.originX, this.originY);
      if (isInsideGrid(q, r)) {
        const key = `${q},${r}`;
        if (isDrag && this.lastTouchedKey === key) return;
        this.lastTouchedKey = key;
        this.selectedCellKey = key;

        if (this.onCellSelect) {
          const cell = this.sequencer.getCell(q, r);
          this.onCellSelect(q, r, cell);
        }
      }
    };

    this.canvas.addEventListener('pointerdown', (e) => {
      this.isPointerDown = true;
      this.canvas.setPointerCapture(e.pointerId);
      handlePointerAction(e, false);
    });

    this.canvas.addEventListener('pointermove', (e) => {
      if (this.isPointerDown) {
        handlePointerAction(e, true);
      }
    });

    const pointerUp = (e: PointerEvent) => {
      this.isPointerDown = false;
      this.lastTouchedKey = null;
      try {
        this.canvas.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
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

    // 3. Render 37 Hexagonal Cells
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
    const isDead = isCenter || cell.isDead || cell.sound === 'DEAD';
    const isEnabled = !isDead && (cell.enabled || (cell.sound !== 'NONE' && cell.sound !== 'DEAD'));
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

    // Inner Labels & Modifier Glyphs
    this.drawCellContent(x, y, cell, isDead, isEnabled);
  }

  private drawCellContent(x: number, y: number, cell: Cell, isDead: boolean, isEnabled: boolean) {
    if (isDead) {
      // Color alone represents dead cells; no cross or DEAD wording
      return;
    }

    // Color alone represents enabled cells; no dot or spark
    if (cell.modifier !== 'NONE') {
      this.drawModifierGlyph(x, y, cell.modifier, isEnabled);
    }
  }

  private drawArrowHead(tipX: number, tipY: number, angle: number, size: number) {
    const headLen = size;
    const backAngle1 = angle + Math.PI - 0.45;
    const backAngle2 = angle + Math.PI + 0.45;
    this.ctx.beginPath();
    this.ctx.moveTo(tipX, tipY);
    this.ctx.lineTo(tipX + headLen * Math.cos(backAngle1), tipY + headLen * Math.sin(backAngle1));
    this.ctx.lineTo(tipX + (headLen * 0.6) * Math.cos(angle + Math.PI), tipY + (headLen * 0.6) * Math.sin(angle + Math.PI));
    this.ctx.lineTo(tipX + headLen * Math.cos(backAngle2), tipY + headLen * Math.sin(backAngle2));
    this.ctx.closePath();
    this.ctx.fill();
  }

  private drawModifierGlyph(x: number, y: number, modifier: ModifierType, hasSound: boolean) {
    if (modifier === 'NONE') return;

    const scale = Math.max(0.7, Math.min(1.3, this.hexSize / 36));
    const strokeColor = hasSound ? '#ffffff' : '#00ffff';
    const fillColor = hasSound ? '#ffffff' : '#00ffff';

    if (modifier in COMPASS_DIR_MAP) {
      const dirIndex = COMPASS_DIR_MAP[modifier];
      const angle = HEX_DIRECTIONS[dirIndex].angle;

      this.ctx.save();
      this.ctx.strokeStyle = strokeColor;
      this.ctx.fillStyle = fillColor;
      this.ctx.lineWidth = 2.2 * scale;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';

      this.ctx.translate(x, y);
      this.ctx.rotate(angle);

      // Shaft pointing along positive X axis toward facet
      const shaftLen = 8.5 * scale;
      const backOffset = 5.5 * scale;
      this.ctx.beginPath();
      this.ctx.moveTo(-backOffset, 0);
      this.ctx.lineTo(shaftLen - 2.5 * scale, 0);
      this.ctx.stroke();

      // Sharp filled arrowhead
      this.drawArrowHead(shaftLen, 0, 0, 5.5 * scale);

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


