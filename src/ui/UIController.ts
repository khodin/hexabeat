import { AudioEngine } from '../audio/AudioEngine';
import { Sequencer } from '../sequencer/Sequencer';
import { HexCanvas } from './HexCanvas';
import { ModifierType, Cell, ProjectData } from '../grid/HexTypes';
import { PRESETS } from '../sequencer/Presets';
import { ProjectStorage } from '../sequencer/ProjectStorage';

export type CellTool = 'ENABLE' | 'DISABLE' | 'DEAD';

export class UIController {
  private activeTool: CellTool = 'ENABLE';
  private activeModifier: ModifierType = 'NONE';
  private currentProjectName: string = '';

  // DOM Elements
  private btnPlay = document.getElementById('btn-play') as HTMLButtonElement;
  private btnStep = document.getElementById('btn-step') as HTMLButtonElement;
  private btnReset = document.getElementById('btn-reset') as HTMLButtonElement;
  private btnResetHeadsDock = document.getElementById('btn-reset-heads-dock') as HTMLButtonElement | null;
  private btnResetHeadsBottom = document.getElementById('btn-reset-heads-bottom') as HTMLButtonElement | null;
  private btnClear = document.getElementById('btn-clear') as HTMLButtonElement;
  private bpmSlider = document.getElementById('bpm-slider') as HTMLInputElement;
  private bpmValue = document.getElementById('bpm-value') as HTMLSpanElement;
  private presetSelect = document.getElementById('preset-select') as HTMLSelectElement;
  private optgroupSaved = document.getElementById('optgroup-saved') as HTMLOptGroupElement | null;
  private cellInfo = document.getElementById('selected-cell-info') as HTMLSpanElement;
  private stepIndicator = document.getElementById('step-indicator') as HTMLSpanElement;

  // Project Save & Load Elements
  private btnSaveProject = document.getElementById('btn-save-project') as HTMLButtonElement | null;
  private btnLoadProject = document.getElementById('btn-load-project') as HTMLButtonElement | null;
  private modalSave = document.getElementById('modal-save') as HTMLDivElement | null;
  private modalLoad = document.getElementById('modal-load') as HTMLDivElement | null;
  private projectNameInput = document.getElementById('project-name-input') as HTMLInputElement | null;
  private saveSummaryBpm = document.getElementById('save-summary-bpm') as HTMLElement | null;
  private saveSummaryCells = document.getElementById('save-summary-cells') as HTMLElement | null;
  private btnConfirmSave = document.getElementById('btn-confirm-save') as HTMLButtonElement | null;
  private btnExportJson = document.getElementById('btn-export-json') as HTMLButtonElement | null;
  private btnCloseSaveModal = document.getElementById('btn-close-save-modal') as HTMLButtonElement | null;
  private btnCloseLoadModal = document.getElementById('btn-close-load-modal') as HTMLButtonElement | null;
  private btnCloseLoad = document.getElementById('btn-close-load') as HTMLButtonElement | null;
  private fileImportProject = document.getElementById('file-import-project') as HTMLInputElement | null;
  private savedProjectsList = document.getElementById('saved-projects-list') as HTMLDivElement | null;

  private toolButtons: HTMLButtonElement[] = [];
  private modifierButtons: HTMLButtonElement[] = [];
  private playheadButtons: HTMLButtonElement[] = [];

  constructor(
    private audioEngine: AudioEngine,
    private sequencer: Sequencer,
    private hexCanvas: HexCanvas
  ) {
    this.initElements();
    this.initEvents();
    this.initProjectControls();
    this.updatePlayheadButtonStates();
    this.updatePresetSelectDropdown();
  }

  private initElements() {
    this.toolButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('#cell-palette .tool-btn'));
    this.modifierButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('#modifier-palette .mod-btn'));
    this.playheadButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('.playhead-toggles .p-toggle'));
  }

  private initEvents() {
    // 1. Play / Pause
    this.btnPlay.addEventListener('click', () => {
      if (this.audioEngine.getIsPlaying()) {
        this.audioEngine.stop();
        this.btnPlay.textContent = '▶ PLAY';
        this.btnPlay.classList.remove('is-playing');
      } else {
        this.audioEngine.start();
        this.btnPlay.textContent = '⏸ PAUSE';
        this.btnPlay.classList.add('is-playing');
      }
    });

    // 2. Step forward manually
    this.btnStep.addEventListener('click', () => {
      this.sequencer.stepManual();
    });

    // 3. Reset Heads to Circle 1 Starting Positions
    const handleReset = () => {
      this.sequencer.resetPlayheadsToCenter();
      this.stepIndicator.textContent = 'Step: 0';
      this.updatePlayheadButtonStates();
    };
    if (this.btnReset) this.btnReset.addEventListener('click', handleReset);
    if (this.btnResetHeadsDock) this.btnResetHeadsDock.addEventListener('click', handleReset);
    if (this.btnResetHeadsBottom) this.btnResetHeadsBottom.addEventListener('click', handleReset);

    // 4. Clear Grid
    this.btnClear.addEventListener('click', () => {
      this.sequencer.clearGrid();
      this.stepIndicator.textContent = 'Step: 0';
      this.updatePlayheadButtonStates();
    });

    // 5. BPM Slider
    this.bpmSlider.addEventListener('input', () => {
      const bpm = parseInt(this.bpmSlider.value, 10);
      this.bpmValue.textContent = `${bpm}`;
      this.audioEngine.setBpm(bpm);
    });

    // 6. Presets & Saved Projects
    this.presetSelect.addEventListener('change', () => {
      const selectedId = this.presetSelect.value;
      if (selectedId.startsWith('proj_')) {
        const project = ProjectStorage.getProject(selectedId);
        if (project) {
          this.loadProject(project);
        }
        return;
      }
      const preset = PRESETS.find(p => p.id === selectedId);
      if (preset) {
        this.sequencer.loadPreset(preset);
        this.bpmSlider.value = `${preset.bpm}`;
        this.bpmValue.textContent = `${preset.bpm}`;
        this.currentProjectName = preset.name;
        this.updatePlayheadButtonStates();
        this.cellInfo.textContent = `Preset loaded: ${preset.name}`;
      }
    });

    // 7. Cell Tool Buttons (Enable / Disable / Dead / Clear)
    this.toolButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tool = btn.dataset.tool as CellTool;
        this.setActiveTool(tool);
      });
    });

    // 8. Modifier Palette buttons
    this.modifierButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const mod = btn.dataset.mod as ModifierType;
        this.setActiveModifier(mod);
      });
    });

    // 9. Playhead Toggles
    this.playheadButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id || '1', 10);
        const isActive = this.sequencer.togglePlayhead(id);
        btn.classList.toggle('active', isActive);
        const playhead = this.sequencer.getPlayheads().find(p => p.id === id);
        if (isActive && playhead) {
          this.audioEngine.previewSound(playhead.sound);
        }
      });
    });

    // 10. Hex Canvas Cell Click / Touch
    this.hexCanvas.setOnCellSelect((q: number, r: number, cell?: Cell) => {
      if (!cell) return;

      const isCenter = q === 0 && r === 0;
      if (isCenter) {
        this.updateCellInfo(0, 0, false, true, 'NONE');
        return;
      }

      switch (this.activeTool) {
        case 'ENABLE': {
          if (cell.enabled && this.activeModifier === 'NONE') {
            // Toggle off
            this.sequencer.setCell(q, r, false, false, cell.modifier);
            this.updateCellInfo(q, r, false, false, cell.modifier);
          } else {
            const mod = this.activeModifier !== 'NONE' ? this.activeModifier : cell.modifier;
            this.sequencer.setCell(q, r, true, false, mod);
            this.updateCellInfo(q, r, true, false, mod);
            const activeHead = this.sequencer.getPlayheads().find(p => p.active);
            if (activeHead) {
              this.audioEngine.previewSound(activeHead.sound, q * 3 + r * 5);
            }
          }
          break;
        }
        case 'DISABLE': {
          const mod = this.activeModifier !== 'NONE' ? this.activeModifier : 'NONE';
          this.sequencer.setCell(q, r, false, false, mod);
          this.updateCellInfo(q, r, false, false, mod);
          break;
        }
        case 'DEAD': {
          const isNowDead = !cell.isDead;
          this.sequencer.setCell(q, r, false, isNowDead, 'NONE');
          this.updateCellInfo(q, r, false, isNowDead, 'NONE');
          break;
        }
      }
    });

    // 11. Sequencer Step Listener
    this.sequencer.addStepListener((stepIndex: number) => {
      this.stepIndicator.textContent = `Step: ${stepIndex}`;
    });
  }

  private setActiveTool(tool: CellTool) {
    this.activeTool = tool;
    this.toolButtons.forEach(b => {
      b.classList.toggle('active', b.dataset.tool === tool);
    });
  }

  private setActiveModifier(mod: ModifierType) {
    this.activeModifier = mod;
    this.modifierButtons.forEach(b => {
      b.classList.toggle('active', b.dataset.mod === mod);
    });
  }

  private updateCellInfo(q: number, r: number, enabled: boolean, isDead: boolean, modifier: ModifierType) {
    if (q === 0 && r === 0) {
      this.cellInfo.textContent = `Center Core (Obstacle)`;
    } else if (isDead) {
      this.cellInfo.textContent = `Cell: (${q}, ${r}) • DEAD WALL`;
    } else {
      const stateStr = enabled ? 'ENABLED' : 'DISABLED';
      this.cellInfo.textContent = `Cell: (${q}, ${r}) • ${stateStr} • ${modifier}`;
    }
  }

  private updatePlayheadButtonStates() {
    const playheads = this.sequencer.getPlayheads();
    this.playheadButtons.forEach(btn => {
      const id = parseInt(btn.dataset.id || '1', 10);
      const playhead = playheads.find(p => p.id === id);
      if (playhead) {
        btn.classList.toggle('active', playhead.active);
      }
    });
  }

  private initProjectControls() {
    // Open Save Modal
    this.btnSaveProject?.addEventListener('click', () => {
      if (!this.modalSave) return;
      const bpm = this.audioEngine.getBpm();
      let configuredCells = 0;
      this.sequencer.getGrid().forEach(c => {
        if (c.enabled || c.isDead || c.modifier !== 'NONE') configuredCells++;
      });

      if (this.projectNameInput) {
        this.projectNameInput.value = this.currentProjectName || `Groove ${ProjectStorage.listProjects().length + 1}`;
      }
      if (this.saveSummaryBpm) this.saveSummaryBpm.textContent = `${bpm} BPM`;
      if (this.saveSummaryCells) this.saveSummaryCells.textContent = `${configuredCells} Configured`;

      this.modalSave.classList.remove('hidden');
      setTimeout(() => this.projectNameInput?.focus(), 60);
    });

    // Close Save Modal
    this.btnCloseSaveModal?.addEventListener('click', () => {
      this.modalSave?.classList.add('hidden');
    });

    // Confirm Save to Storage
    this.btnConfirmSave?.addEventListener('click', () => {
      const name = this.projectNameInput?.value.trim() || 'Untitled Project';
      const bpm = this.audioEngine.getBpm();
      const project = this.sequencer.createProjectData(name, bpm);
      const saved = ProjectStorage.saveProject(project);
      this.currentProjectName = saved.name;
      this.updatePresetSelectDropdown(saved.id);
      this.modalSave?.classList.add('hidden');
      this.cellInfo.textContent = `Saved project "${saved.name}"`;
    });

    // Export JSON File
    this.btnExportJson?.addEventListener('click', () => {
      const name = this.projectNameInput?.value.trim() || 'Untitled Project';
      const bpm = this.audioEngine.getBpm();
      const project = this.sequencer.createProjectData(name, bpm);
      ProjectStorage.exportToFile(project);
      this.modalSave?.classList.add('hidden');
      this.cellInfo.textContent = `Exported "${project.name}.json"`;
    });

    // Open Load Modal
    this.btnLoadProject?.addEventListener('click', () => {
      this.renderSavedProjectsList();
      this.modalLoad?.classList.remove('hidden');
    });

    // Close Load Modal
    const closeLoad = () => this.modalLoad?.classList.add('hidden');
    this.btnCloseLoadModal?.addEventListener('click', closeLoad);
    this.btnCloseLoad?.addEventListener('click', closeLoad);

    // Close on backdrop click
    [this.modalSave, this.modalLoad].forEach(modal => {
      modal?.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
      });
    });

    // Close on Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.modalSave?.classList.add('hidden');
        this.modalLoad?.classList.add('hidden');
      }
    });

    // Import project from JSON file
    this.fileImportProject?.addEventListener('change', async () => {
      const file = this.fileImportProject?.files?.[0];
      if (!file) return;
      try {
        const imported = await ProjectStorage.importFromFile(file);
        const saved = ProjectStorage.saveProject(imported);
        this.loadProject(saved);
        this.renderSavedProjectsList();
        this.modalLoad?.classList.add('hidden');
        this.cellInfo.textContent = `Imported & loaded "${saved.name}"`;
      } catch (err: any) {
        alert(`Failed to import project: ${err.message || 'Invalid format'}`);
      } finally {
        if (this.fileImportProject) this.fileImportProject.value = '';
      }
    });
  }

  private loadProject(project: ProjectData) {
    this.sequencer.loadProject(project);
    this.bpmSlider.value = `${project.bpm}`;
    this.bpmValue.textContent = `${project.bpm}`;
    this.currentProjectName = project.name;
    this.updatePlayheadButtonStates();
    this.updatePresetSelectDropdown(project.id);
    this.modalLoad?.classList.add('hidden');
    this.cellInfo.textContent = `Loaded project "${project.name}" • ${project.bpm} BPM`;
  }

  private renderSavedProjectsList() {
    if (!this.savedProjectsList) return;
    const projects = ProjectStorage.listProjects();
    this.savedProjectsList.innerHTML = '';

    if (projects.length === 0) {
      const emptyMsg = document.createElement('div');
      emptyMsg.className = 'empty-projects-msg';
      emptyMsg.textContent = 'No saved projects yet. Click "SAVE" to store your grooves!';
      this.savedProjectsList.appendChild(emptyMsg);
      return;
    }

    projects.forEach(project => {
      const item = document.createElement('div');
      item.className = 'saved-project-item';

      const dateStr = new Date(project.updatedAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      item.innerHTML = `
        <div class="project-item-info">
          <span class="project-item-name">${this.escapeHtml(project.name)}</span>
          <span class="project-item-meta">${project.bpm} BPM • ${project.cells.length} cells • ${dateStr}</span>
        </div>
        <div class="project-item-actions">
          <button class="btn btn-sm btn-item-load" title="Load this project">▶ Load</button>
          <button class="btn btn-sm btn-item-export" title="Download as JSON file">⬇</button>
          <button class="btn btn-sm btn-item-delete" title="Delete project">🗑</button>
        </div>
      `;

      item.querySelector('.btn-item-load')?.addEventListener('click', () => {
        this.loadProject(project);
      });

      item.querySelector('.btn-item-export')?.addEventListener('click', (e) => {
        e.stopPropagation();
        ProjectStorage.exportToFile(project);
      });

      item.querySelector('.btn-item-delete')?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(`Delete project "${project.name}"?`)) {
          ProjectStorage.deleteProject(project.id);
          this.renderSavedProjectsList();
          this.updatePresetSelectDropdown();
        }
      });

      this.savedProjectsList?.appendChild(item);
    });
  }

  private updatePresetSelectDropdown(selectedId?: string) {
    if (!this.optgroupSaved) return;
    this.optgroupSaved.innerHTML = '';
    const projects = ProjectStorage.listProjects();

    projects.forEach(project => {
      const opt = document.createElement('option');
      opt.value = project.id;
      opt.textContent = `★ ${project.name}`;
      this.optgroupSaved?.appendChild(opt);
    });

    if (selectedId) {
      this.presetSelect.value = selectedId;
    }
  }

  private escapeHtml(str: string): string {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}
