import { AudioEngine } from '../audio/AudioEngine';
import { Sequencer } from '../sequencer/Sequencer';
import { HexCanvas } from './HexCanvas';
import { ModifierType, ProjectData } from '../grid/HexTypes';
import { PRESETS } from '../sequencer/Presets';
import { ProjectStorage } from '../sequencer/ProjectStorage';
import { TutorialModal } from './TutorialModal';
import { getLocale, setLocale, t, formatString, Locale } from '../i18n/translations';

export type CellTool = 'ENABLE' | 'DISABLE' | 'DEAD';

export class UIController {
  private currentProjectName: string = '';
  private currentStep: number = 0;
  private tutorialModal: TutorialModal;

  // DOM Elements
  private btnHelp = document.getElementById('btn-help') as HTMLButtonElement | null;
  private btnLang = document.getElementById('btn-lang') as HTMLButtonElement | null;
  private btnPlay = document.getElementById('btn-play') as HTMLButtonElement;
  private btnStop = document.getElementById('btn-stop') as HTMLButtonElement | null;
  private btnShareProject = document.getElementById('btn-share-project') as HTMLButtonElement | null;
  private btnShareModal = document.getElementById('btn-share-modal') as HTMLButtonElement | null;
  private btnClear = document.getElementById('btn-clear') as HTMLButtonElement;
  private bpmSlider = document.getElementById('bpm-slider') as HTMLInputElement;
  private bpmValue = document.getElementById('bpm-value') as HTMLSpanElement;
  private presetSelect = document.getElementById('preset-select') as HTMLSelectElement;
  private optgroupSaved = document.getElementById('optgroup-saved') as HTMLOptGroupElement | null;
  private cellInfo = document.getElementById('selected-cell-info') as HTMLSpanElement;
  private stepIndicator = document.getElementById('step-indicator') as HTMLSpanElement;
  private toast = document.getElementById('toast') as HTMLDivElement | null;
  private toastTimeout: any = null;

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

  // Selected Cell & Routing Elements
  private btnToggleWall = document.getElementById('btn-toggle-wall') as HTMLButtonElement | null;
  private btnOpenRoute = document.getElementById('btn-open-route') as HTMLButtonElement | null;
  private btnClearRoute = document.getElementById('btn-clear-route') as HTMLButtonElement | null;
  private modalRoute = document.getElementById('modal-route') as HTMLDivElement | null;
  private btnCloseRouteModal = document.getElementById('btn-close-route-modal') as HTMLButtonElement | null;
  private btnCloseRoute = document.getElementById('btn-close-route') as HTMLButtonElement | null;
  private btnModalClearRoute = document.getElementById('btn-modal-clear-route') as HTMLButtonElement | null;
  private selectedCoords: { q: number; r: number } | null = null;

  constructor(
    private audioEngine: AudioEngine,
    private sequencer: Sequencer,
    private hexCanvas: HexCanvas
  ) {
    this.tutorialModal = new TutorialModal();
    this.initEvents();
    this.initProjectControls();
    this.initLanguageAndHelp();
    this.initUrlShare();
    this.updateAllTranslations();
    this.updatePresetSelectDropdown();
    this.updateSelectedCellHud();

    const initialPreset = PRESETS[0];
    if (initialPreset) {
      this.bpmSlider.value = `${initialPreset.bpm}`;
      this.bpmValue.textContent = `${initialPreset.bpm}`;
      this.audioEngine.setBpm(initialPreset.bpm);
    }

    if (this.tutorialModal.shouldAutoShow()) {
      setTimeout(() => this.tutorialModal.show(), 400);
    }
  }

  private initLanguageAndHelp() {
    this.btnHelp?.addEventListener('click', () => {
      this.tutorialModal.show();
    });

    this.btnLang?.addEventListener('click', () => {
      const current = getLocale();
      const next: Locale = current === 'fr' ? 'en' : 'fr';
      setLocale(next);
      this.updateAllTranslations();
      this.tutorialModal.renderSlideContent();
    });
  }

  private initEvents() {
    // 1. Play / Pause
    this.btnPlay.addEventListener('click', () => {
      if (this.audioEngine.getIsPlaying()) {
        this.audioEngine.stop();
        this.btnPlay.textContent = t('play');
        this.btnPlay.classList.remove('is-playing');
      } else {
        this.audioEngine.start();
        this.btnPlay.textContent = t('pause');
        this.btnPlay.classList.add('is-playing');
      }
    });

    // 2. Stop Playback & Put Playheads back to Departure Positions on circle 1
    const handleStop = () => {
      this.sequencer.stop();
      this.btnPlay.textContent = t('play');
      this.btnPlay.classList.remove('is-playing');
      this.currentStep = 0;
      this.stepIndicator.textContent = formatString(t('stepPrefix'), 0);
      this.cellInfo.textContent = t('stoppedInfo');
      this.selectedCoords = null;
      this.hexCanvas.setSelectedCell(0, null);
      this.updateSelectedCellHud();
    };
    if (this.btnStop) this.btnStop.addEventListener('click', handleStop);

    // 3. Clear Grid
    this.btnClear.addEventListener('click', () => {
      this.sequencer.clearGrid();
      this.btnPlay.textContent = t('play');
      this.btnPlay.classList.remove('is-playing');
      this.currentStep = 0;
      this.stepIndicator.textContent = formatString(t('stepPrefix'), 0);
      this.cellInfo.textContent = t('gridCleared');
      this.selectedCoords = null;
      this.hexCanvas.setSelectedCell(0, null);
      this.updateSelectedCellHud();
    });

    // 4. BPM Slider
    this.bpmSlider.addEventListener('input', () => {
      const bpm = parseInt(this.bpmSlider.value, 10);
      this.bpmValue.textContent = `${bpm}`;
      this.audioEngine.setBpm(bpm);
    });

    // 5. Presets & Saved Projects
    this.presetSelect.addEventListener('change', () => {
      // Stop playback, return playheads to departure bays, and reset step counter
      this.sequencer.stop();
      this.btnPlay.textContent = t('play');
      this.btnPlay.classList.remove('is-playing');
      this.currentStep = 0;
      this.stepIndicator.textContent = formatString(t('stepPrefix'), 0);
      this.selectedCoords = null;
      this.hexCanvas.setSelectedCell(0, null);
      this.updateSelectedCellHud();

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
        this.audioEngine.setBpm(preset.bpm);
        this.currentProjectName = preset.name;
        this.cellInfo.textContent = formatString(t('presetLoaded'), preset.name);
      }
    });

    // 6. Direct Cell Selection & Editing
    this.hexCanvas.setOnCellAction((_action, q, r, _dirIndex, cell) => {
      if (!cell) return;

      const isCenter = q === 0 && r === 0;
      if (isCenter) {
        this.selectedCoords = null;
        this.hexCanvas.setSelectedCell(0, null);
        this.cellInfo.textContent = t('centerCore');
        this.updateSelectedCellHud();
        return;
      }

      const isDeparture = this.sequencer.isDepartureCell(q, r);
      if (isDeparture) {
        this.selectedCoords = null;
        this.hexCanvas.setSelectedCell(q, r);
        const head = this.sequencer.getDeparturePlayhead(q, r);
        if (head) {
          const isActive = this.sequencer.togglePlayhead(head.id);
          if (isActive) {
            this.audioEngine.previewSound(head.sound);
          }
          this.cellInfo.textContent = `${t('headPrefix')} ${head.id} (${head.name}): ${isActive ? t('headActive') : t('headMuted')}`;
        }
        this.updateSelectedCellHud();
        return;
      }

      // Normal cell (r >= 2):
      this.selectedCoords = { q, r };
      this.hexCanvas.setSelectedCell(q, r);

      // Tapping cell toggles Beat (Enable <-> Disable)
      if (cell.isDead) {
        // If it's a dead wall, tapping selects it so user can click [Unblock]
        this.cellInfo.textContent = `${t('cellPrefix')} (${q}, ${r}) • ${t('impassableWall')}`;
      } else if (cell.enabled) {
        this.sequencer.setCell(q, r, false, false, cell.modifier);
        this.cellInfo.textContent = `${t('cellPrefix')} (${q}, ${r}) • ${t('beatDisabled')}`;
      } else {
        this.sequencer.setCell(q, r, true, false, cell.modifier);
        this.cellInfo.textContent = `${t('cellPrefix')} (${q}, ${r}) • ${t('beatEnabled')}`;
        const activeHead = this.sequencer.getPlayheads().find(p => p.active);
        if (activeHead) {
          this.audioEngine.previewSound(activeHead.sound, q * 3 + r * 5);
        }
      }

      this.updateSelectedCellHud();
    });

    // Wall Toggle Button in bottom bar
    this.btnToggleWall?.addEventListener('click', () => {
      if (!this.selectedCoords) return;
      const { q, r } = this.selectedCoords;
      const cell = this.sequencer.getCell(q, r);
      if (!cell) return;

      const isNowDead = !cell.isDead;
      if (isNowDead) {
        this.sequencer.setCell(q, r, false, true, 'NONE');
        this.cellInfo.textContent = `${t('cellPrefix')} (${q}, ${r}) • ${t('wallPlaced')}`;
      } else {
        this.sequencer.setCell(q, r, false, false, 'NONE');
        this.cellInfo.textContent = `${t('cellPrefix')} (${q}, ${r}) • ${t('wallRemoved')}`;
      }
      this.updateSelectedCellHud();
    });

    // Open Route Modal Button
    this.btnOpenRoute?.addEventListener('click', () => {
      if (!this.selectedCoords) return;
      this.openRouteModal();
    });

    // Quick Clear Route Button in Bottom Bar
    this.btnClearRoute?.addEventListener('click', () => {
      if (!this.selectedCoords) return;
      const { q, r } = this.selectedCoords;
      const cell = this.sequencer.getCell(q, r);
      if (!cell) return;

      this.sequencer.setCell(q, r, cell.enabled, false, 'NONE');
      this.showToast(formatString(t('routeRemovedToast'), q, r));
      this.cellInfo.textContent = `${t('cellPrefix')} (${q}, ${r}) • ${t('routeCleared')}`;
      this.updateSelectedCellHud();
    });

    // Close Route Modal Handlers
    this.btnCloseRouteModal?.addEventListener('click', () => {
      this.modalRoute?.classList.add('hidden');
    });
    this.btnCloseRoute?.addEventListener('click', () => {
      this.modalRoute?.classList.add('hidden');
    });

    // Route Options in Modal
    const routeOptButtons = document.querySelectorAll('.btn-route-opt');
    routeOptButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (!this.selectedCoords) return;
        const dir = btn.getAttribute('data-dir') as ModifierType;
        const { q, r } = this.selectedCoords;
        const cell = this.sequencer.getCell(q, r);
        if (!cell) return;

        // Set route modifier (and auto-enable sound if not dead wall)
        const enabled = cell.isDead ? false : true;
        this.sequencer.setCell(q, r, enabled, false, dir);
        this.cellInfo.textContent = `${t('cellPrefix')} (${q}, ${r}) • ${formatString(t('routeSet'), dir)}`;
        this.modalRoute?.classList.add('hidden');
        this.updateSelectedCellHud();
      });
    });

    // Clear Route Button in Modal
    this.btnModalClearRoute?.addEventListener('click', () => {
      if (!this.selectedCoords) return;
      const { q, r } = this.selectedCoords;
      const cell = this.sequencer.getCell(q, r);
      if (!cell) return;

      this.sequencer.setCell(q, r, cell.enabled, false, 'NONE');
      this.showToast(formatString(t('routeRemovedToast'), q, r));
      this.cellInfo.textContent = `${t('cellPrefix')} (${q}, ${r}) • ${t('routeCleared')}`;
      this.modalRoute?.classList.add('hidden');
      this.updateSelectedCellHud();
    });

    // 7. Sequencer Step Listener
    this.sequencer.addStepListener((stepIndex: number) => {
      this.currentStep = stepIndex;
      this.stepIndicator.textContent = formatString(t('stepPrefix'), stepIndex);
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
      if (this.saveSummaryCells) this.saveSummaryCells.textContent = `${configuredCells} ${t('cellsConfigured')}`;

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
      this.cellInfo.textContent = formatString(t('projectLoaded'), saved.name, bpm);
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

    // Share Project via URL (Header / Transport)
    this.btnShareProject?.addEventListener('click', () => {
      this.shareCurrentProject();
    });

    // Share Project via URL (Save Modal)
    this.btnShareModal?.addEventListener('click', () => {
      this.shareCurrentProject();
      this.modalSave?.classList.add('hidden');
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

  public async shareCurrentProject() {
    const name = this.currentProjectName || this.projectNameInput?.value.trim() || 'Groove';
    const bpm = this.audioEngine.getBpm();
    const project = this.sequencer.createProjectData(name, bpm);
    await this.shareProject(project);
  }

  public async shareProject(project: ProjectData) {
    const shareUrl = ProjectStorage.encodeProjectToUrl(project);

    // Try Web Share API (mobile native share sheet)
    if (navigator.share) {
      try {
        await navigator.share({
          title: `HexaBeat • ${project.name}`,
          text: `Check out my HexaBeat groove: ${project.name} (${project.bpm} BPM)!`,
          url: shareUrl
        });
        this.showToast('Project shared successfully!');
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return; // User simply closed the share sheet
      }
    }

    // Fallback: Copy to Clipboard
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        this.showToast(t('shareCopiedToast'));
        this.cellInfo.textContent = t('shareCopiedToast');
      } else {
        prompt('Copy your HexaBeat project link:', shareUrl);
      }
    } catch {
      prompt('Copy your HexaBeat project link:', shareUrl);
    }
  }

  private initUrlShare() {
    const sharedProject = ProjectStorage.decodeProjectFromUrl();
    if (sharedProject) {
      this.loadProject(sharedProject);
      this.showToast(formatString(t('sharedLoadedToast'), sharedProject.name));
    }
  }

  private showToast(message: string) {
    if (!this.toast) return;
    this.toast.textContent = message;
    this.toast.classList.remove('hidden');
    this.toast.classList.add('visible');
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.toast?.classList.remove('visible');
      setTimeout(() => this.toast?.classList.add('hidden'), 300);
    }, 2800);
  }

  private loadProject(project: ProjectData) {
    this.sequencer.stop();
    this.btnPlay.textContent = t('play');
    this.btnPlay.classList.remove('is-playing');
    this.currentStep = 0;
    this.stepIndicator.textContent = formatString(t('stepPrefix'), 0);
    this.selectedCoords = null;
    this.hexCanvas.setSelectedCell(0, null);
    this.updateSelectedCellHud();

    this.sequencer.loadProject(project);
    this.bpmSlider.value = `${project.bpm}`;
    this.bpmValue.textContent = `${project.bpm}`;
    this.audioEngine.setBpm(project.bpm);
    this.currentProjectName = project.name;
    this.updatePresetSelectDropdown(project.id);
    this.modalLoad?.classList.add('hidden');
    this.cellInfo.textContent = formatString(t('projectLoaded'), project.name, project.bpm);
  }

  private renderSavedProjectsList() {
    if (!this.savedProjectsList) return;
    const projects = ProjectStorage.listProjects();
    this.savedProjectsList.innerHTML = '';

    if (projects.length === 0) {
      const emptyMsg = document.createElement('div');
      emptyMsg.className = 'empty-projects-msg';
      emptyMsg.textContent = t('noProjectsMsg');
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
          <span class="project-item-meta">${project.bpm} BPM • ${project.cells.length} ${t('cellsConfigured').toLowerCase()} • ${dateStr}</span>
        </div>
        <div class="project-item-actions">
          <button class="btn btn-sm btn-item-load" title="${t('loadBtn')}">${t('loadBtn')}</button>
          <button class="btn btn-sm btn-item-share" title="${t('shareBtnTitle')}">🔗</button>
          <button class="btn btn-sm btn-item-export" title="${t('exportBtnTitle')}">⬇</button>
          <button class="btn btn-sm btn-item-delete" title="${t('deleteBtnTitle')}">🗑</button>
        </div>
      `;

      item.querySelector('.btn-item-load')?.addEventListener('click', () => {
        this.loadProject(project);
      });

      item.querySelector('.btn-item-share')?.addEventListener('click', async (e) => {
        e.stopPropagation();
        await this.shareProject(project);
      });

      item.querySelector('.btn-item-export')?.addEventListener('click', (e) => {
        e.stopPropagation();
        ProjectStorage.exportToFile(project);
      });

      item.querySelector('.btn-item-delete')?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(formatString(t('deleteConfirm'), project.name))) {
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

  private updateSelectedCellHud() {
    if (!this.selectedCoords) {
      if (this.btnToggleWall) this.btnToggleWall.disabled = true;
      if (this.btnOpenRoute) this.btnOpenRoute.disabled = true;
      if (this.btnClearRoute) this.btnClearRoute.classList.add('hidden');
      return;
    }

    const { q, r } = this.selectedCoords;
    const cell = this.sequencer.getCell(q, r);
    if (!cell) return;

    if (this.btnToggleWall) {
      this.btnToggleWall.disabled = false;
      if (cell.isDead) {
        this.btnToggleWall.textContent = t('btnUnblock');
        this.btnToggleWall.classList.add('is-wall');
      } else {
        this.btnToggleWall.textContent = t('btnWall');
        this.btnToggleWall.classList.remove('is-wall');
      }
    }

    const hasRoute = cell.modifier && cell.modifier !== 'NONE';

    if (this.btnOpenRoute) {
      this.btnOpenRoute.disabled = cell.isDead;
      if (hasRoute) {
        const shortDir = cell.modifier.replace('DIR_', '');
        this.btnOpenRoute.textContent = formatString(t('btnRouteWithDir'), shortDir);
        this.btnOpenRoute.classList.add('is-routed');
      } else {
        this.btnOpenRoute.textContent = t('btnRoute');
        this.btnOpenRoute.classList.remove('is-routed');
      }
    }

    if (this.btnClearRoute) {
      this.btnClearRoute.textContent = t('btnClearRoute');
      if (hasRoute && !cell.isDead) {
        this.btnClearRoute.classList.remove('hidden');
      } else {
        this.btnClearRoute.classList.add('hidden');
      }
    }
  }

  public updateAllTranslations() {
    const isPlaying = this.audioEngine.getIsPlaying();
    if (this.btnPlay) {
      this.btnPlay.textContent = isPlaying ? t('pause') : t('play');
    }
    if (this.btnStop) this.btnStop.textContent = t('stop');
    if (this.btnClear) this.btnClear.textContent = t('clear');
    if (this.btnShareProject) this.btnShareProject.textContent = t('share');
    if (this.btnSaveProject) this.btnSaveProject.textContent = t('save');
    if (this.btnLoadProject) this.btnLoadProject.textContent = t('load');

    const tempoLabel = document.querySelector('.tempo-label');
    if (tempoLabel) tempoLabel.textContent = t('bpm');

    if (this.btnHelp) {
      this.btnHelp.title = t('helpTitle');
    }

    if (this.btnLang) {
      const curLocale = getLocale();
      this.btnLang.textContent = curLocale === 'fr' ? 'EN' : 'FR';
      this.btnLang.title = t('langTitle');
    }

    const githubBtn = document.querySelector('.github-btn') as HTMLElement | null;
    if (githubBtn) {
      githubBtn.title = t('githubTitle');
    }

    // Presets dropdown optgroups & items
    const optPresets = document.getElementById('optgroup-presets') as HTMLOptGroupElement | null;
    if (optPresets) optPresets.label = t('optgroupPresets');
    if (this.optgroupSaved) this.optgroupSaved.label = t('optgroupSaved');

    const presetOptionMap: Record<string, string> = {
      'techno-drive': t('presetTechno'),
      'polyrhythm-orbit': t('presetPolyrhythm'),
      'hiphop-groove': t('presetHiphop'),
      'trap-808': t('presetTrap'),
      'ambient-nexus': t('presetNexus'),
      'acid-honeycomb': t('presetAcid'),
      'idm-generative': t('presetIdm'),
      'blank': t('presetBlank'),
    };

    const options = this.presetSelect.querySelectorAll('option');
    options.forEach(opt => {
      if (presetOptionMap[opt.value]) {
        opt.textContent = presetOptionMap[opt.value];
      }
    });

    // Step indicator
    this.stepIndicator.textContent = formatString(t('stepPrefix'), this.currentStep);

    // Save modal labels
    const saveTitle = document.querySelector('#modal-save .modal-title');
    if (saveTitle) saveTitle.textContent = t('saveModalTitle');
    const nameLabel = document.querySelector('label[for="project-name-input"]');
    if (nameLabel) nameLabel.textContent = t('projectNameLabel');
    if (this.projectNameInput) this.projectNameInput.placeholder = t('projectNamePlaceholder');
    if (this.btnShareModal) this.btnShareModal.textContent = t('shareLinkBtn');
    if (this.btnExportJson) this.btnExportJson.textContent = t('exportFileBtn');
    if (this.btnConfirmSave) this.btnConfirmSave.textContent = t('saveProjectBtn');

    // Load modal labels
    const loadTitle = document.querySelector('#modal-load .modal-title');
    if (loadTitle) loadTitle.textContent = t('loadModalTitle');
    const loadSubtitle = document.querySelector('.load-subtitle');
    if (loadSubtitle) loadSubtitle.textContent = t('savedGrooves');
    const btnImport = document.querySelector('.btn-import');
    if (btnImport) {
      const fileInput = document.getElementById('file-import-project');
      btnImport.innerHTML = `${t('importFileBtn')} `;
      if (fileInput) btnImport.appendChild(fileInput);
    }
    if (this.btnCloseLoad) this.btnCloseLoad.textContent = t('closeBtn');

    // Route modal labels
    const routeTitle = document.querySelector('#modal-route .modal-title');
    if (routeTitle) routeTitle.textContent = t('routeModalTitle');
    const routeDesc = document.querySelector('#modal-route .modal-desc');
    if (routeDesc) routeDesc.textContent = t('routeModalDesc');
    const routeDirMap: Record<string, { arrow: string; label: string }> = {
      'DIR_TL': { arrow: '↖', label: t('dirTL') },
      'DIR_TR': { arrow: '↗', label: t('dirTR') },
      'DIR_L': { arrow: '←', label: t('dirL') },
      'DIR_R': { arrow: '→', label: t('dirR') },
      'DIR_BL': { arrow: '↙', label: t('dirBL') },
      'DIR_BR': { arrow: '↘', label: t('dirBR') },
    };
    const routeButtons = document.querySelectorAll('.btn-route-opt');
    routeButtons.forEach(btn => {
      const dir = btn.getAttribute('data-dir');
      if (dir && routeDirMap[dir]) {
        btn.innerHTML = `<span class="route-arrow">${routeDirMap[dir].arrow}</span> ${routeDirMap[dir].label}`;
      }
    });
    if (this.btnModalClearRoute) this.btnModalClearRoute.textContent = t('removeRoute');
    if (this.btnCloseRoute) this.btnCloseRoute.textContent = t('done');

    // Tutorial modal header & tabs
    const tutTitle = document.getElementById('tutorial-modal-title');
    if (tutTitle) tutTitle.textContent = t('tutorialTitle');
    const tab0 = document.getElementById('tab-0');
    if (tab0) tab0.textContent = t('tabConcept');
    const tab1 = document.getElementById('tab-1');
    if (tab1) tab1.textContent = t('tabHeads');
    const tab2 = document.getElementById('tab-2');
    if (tab2) tab2.textContent = t('tabCellsWalls');
    const tab3 = document.getElementById('tab-3');
    if (tab3) tab3.textContent = t('tabRouting');
    const tab4 = document.getElementById('tab-4');
    if (tab4) tab4.textContent = t('tabShare');

    // Cell HUD & status
    this.updateSelectedCellHud();
    if (!this.selectedCoords && !isPlaying) {
      this.cellInfo.textContent = t('tapCellHint');
    }

    // Re-render project list if modal is present
    this.renderSavedProjectsList();
  }

  private openRouteModal() {
    if (!this.selectedCoords || !this.modalRoute) return;
    const { q, r } = this.selectedCoords;
    const cell = this.sequencer.getCell(q, r);
    if (!cell) return;

    // Highlight active modifier button in modal
    const routeOptButtons = document.querySelectorAll('.btn-route-opt');
    routeOptButtons.forEach((btn) => {
      const dir = btn.getAttribute('data-dir');
      if (dir === cell.modifier) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    this.modalRoute.classList.remove('hidden');
  }

  private escapeHtml(str: string): string {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}
