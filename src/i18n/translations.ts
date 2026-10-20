export type Locale = 'en' | 'fr';

export interface Translations {
  // Brand & Header
  brandTitle: string;
  githubTitle: string;
  helpTitle: string;
  langTitle: string;
  play: string;
  pause: string;
  stop: string;
  clear: string;
  share: string;
  save: string;
  load: string;
  playTitle: string;
  pauseTitle: string;
  stopTitle: string;
  clearTitle: string;
  shareTitle: string;
  saveTitle: string;
  loadTitle: string;
  bpm: string;

  // Preset Select
  optgroupPresets: string;
  optgroupSaved: string;
  presetPolyrhythm: string;
  presetIdm: string;

  // Bottom Status & HUD
  tapCellHint: string;
  btnWall: string;
  btnUnblock: string;
  btnRoute: string;
  btnRouteWithDir: string;
  btnClearRoute: string;
  stepPrefix: string;

  // Dynamic Status Messages
  cellPrefix: string;
  beatEnabled: string;
  beatDisabled: string;
  impassableWall: string;
  wallPlaced: string;
  wallRemoved: string;
  routeCleared: string;
  routeSet: string;
  centerCore: string;
  headPrefix: string;
  headActive: string;
  headMuted: string;
  stoppedInfo: string;
  gridCleared: string;
  presetLoaded: string;
  projectLoaded: string;
  exportedInfo: string;
  importedInfo: string;
  importError: string;

  // Route Modal
  routeModalTitle: string;
  routeModalDesc: string;
  dirTL: string;
  dirTR: string;
  dirL: string;
  dirR: string;
  dirBL: string;
  dirBR: string;
  removeRoute: string;
  done: string;

  // Save Modal
  saveModalTitle: string;
  projectNameLabel: string;
  projectNamePlaceholder: string;
  tempoLabel: string;
  cellsLabel: string;
  cellsConfigured: string;
  shareLinkBtn: string;
  exportFileBtn: string;
  saveProjectBtn: string;

  // Load Modal
  loadModalTitle: string;
  savedGrooves: string;
  importFileBtn: string;
  noProjectsMsg: string;
  loadBtn: string;
  shareBtnTitle: string;
  exportBtnTitle: string;
  deleteBtnTitle: string;
  deleteConfirm: string;
  closeBtn: string;

  // Toast Notifications
  shareCopiedToast: string;
  shareSuccessToast: string;
  copyPrompt: string;
  routeRemovedToast: string;
  sharedLoadedToast: string;

  // Tutorial Modal
  tutorialTitle: string;
  tabConcept: string;
  tabHeads: string;
  tabCellsWalls: string;
  tabRouting: string;
  tabShare: string;
  btnPrev: string;
  btnNext: string;
  btnStart: string;
}

export const TRANSLATIONS: Record<Locale, Translations> = {
  en: {
    brandTitle: 'HexaBeat',
    githubTitle: 'View Source on GitHub',
    helpTitle: 'Guide & Tutorial',
    langTitle: 'Passer en Français',
    play: '▶',
    pause: '⏸',
    stop: '⏹',
    clear: '🗑',
    share: '🔗',
    save: '💾',
    load: '📁',
    playTitle: 'Play',
    pauseTitle: 'Pause',
    stopTitle: 'Stop & Reset',
    clearTitle: 'Clear Grid',
    shareTitle: 'Share via Link',
    saveTitle: 'Save Project',
    loadTitle: 'Projects Manager',
    bpm: 'BPM',

    optgroupPresets: 'Presets',
    optgroupSaved: 'Saved Projects',
    presetPolyrhythm: 'Hex Polyrhythm',
    presetIdm: 'IDM Generative',

    tapCellHint: 'Tap cell to toggle beat',
    btnWall: 'Wall',
    btnUnblock: 'Unblock',
    btnRoute: 'Route',
    btnRouteWithDir: 'Route (%s)',
    btnClearRoute: 'Clear',
    stepPrefix: 'Step: %s',

    cellPrefix: 'Cell',
    beatEnabled: 'Beat Enabled',
    beatDisabled: 'Beat Disabled',
    impassableWall: 'Wall',
    wallPlaced: 'Wall Placed',
    wallRemoved: 'Wall Removed',
    routeCleared: 'Route Cleared',
    routeSet: 'Route: %s',
    centerCore: 'Center Core (Blocked)',
    headPrefix: 'Head',
    headActive: 'ENABLED',
    headMuted: 'MUTED',
    stoppedInfo: 'Stopped • Playheads at departure bays',
    gridCleared: 'Grid Cleared',
    presetLoaded: 'Preset: %s',
    projectLoaded: 'Loaded project "%s" • %s BPM',
    exportedInfo: 'Exported "%s.json"',
    importedInfo: 'Imported & loaded "%s"',
    importError: 'Failed to import project: %s',

    routeModalTitle: '🧭 Route Direction',
    routeModalDesc: 'Direct playheads entering this cell along a compass path:',
    dirTL: 'Top-Left',
    dirTR: 'Top-Right',
    dirL: 'Left',
    dirR: 'Right',
    dirBL: 'Bottom-Left',
    dirBR: 'Bottom-Right',
    removeRoute: '✕ Remove Route',
    done: 'Done',

    saveModalTitle: '💾 Save Project',
    projectNameLabel: 'Project Name',
    projectNamePlaceholder: 'e.g. My Track',
    tempoLabel: 'Tempo:',
    cellsLabel: 'Cells:',
    cellsConfigured: 'active',
    shareLinkBtn: '🔗 Share Link',
    exportFileBtn: '⬇ Export File',
    saveProjectBtn: 'Save Project',

    loadModalTitle: '📁 Project Manager',
    savedGrooves: 'Saved Grooves',
    importFileBtn: '⬆ Import File',
    noProjectsMsg: 'No saved projects yet. Click "SAVE" to store your grooves!',
    loadBtn: '▶ Open',
    shareBtnTitle: 'Share via Link',
    exportBtnTitle: 'Download as JSON file',
    deleteBtnTitle: 'Delete',
    deleteConfirm: 'Delete project "%s"?',
    closeBtn: 'Close',

    shareCopiedToast: '🔗 Link copied to clipboard!',
    shareSuccessToast: 'Project shared successfully!',
    copyPrompt: 'Copy your HexaBeat project link:',
    routeRemovedToast: 'Route removed from cell (%s, %s)',
    sharedLoadedToast: '🔗 Loaded shared project: "%s"',

    tutorialTitle: '🎓 HexaBeat Guide & Tutorial',
    tabConcept: '1. Concept',
    tabHeads: '2. Instruments',
    tabCellsWalls: '3. Beats & Walls',
    tabRouting: '4. Routing',
    tabShare: '5. Sharing',
    btnPrev: '← Previous',
    btnNext: 'Next →',
    btnStart: '🚀 Start Jamming!'
  },
  fr: {
    brandTitle: 'HexaBeat',
    githubTitle: 'Code source sur GitHub',
    helpTitle: 'Guide & Aide',
    langTitle: 'Switch to English',
    play: '▶',
    pause: '⏸',
    stop: '⏹',
    clear: '🗑',
    share: '🔗',
    save: '💾',
    load: '📁',
    playTitle: 'Lecture',
    pauseTitle: 'Pause',
    stopTitle: 'Arrêt & Réinitialiser',
    clearTitle: 'Effacer la grille',
    shareTitle: 'Partager par lien',
    saveTitle: 'Enregistrer le projet',
    loadTitle: 'Mes projets',
    bpm: 'BPM',

    optgroupPresets: 'Préréglages',
    optgroupSaved: 'Mes projets',
    presetPolyrhythm: 'Polyrythmie',
    presetIdm: 'IDM',

    tapCellHint: 'Touchez une case pour ajouter un son',
    btnWall: 'Mur',
    btnUnblock: 'Débloquer',
    btnRoute: 'Direction',
    btnRouteWithDir: 'Direction : %s',
    btnClearRoute: 'Effacer',
    stepPrefix: 'Pas : %s',

    cellPrefix: 'Case',
    beatEnabled: 'Son activé',
    beatDisabled: 'Son désactivé',
    impassableWall: 'Mur',
    wallPlaced: 'Mur ajouté',
    wallRemoved: 'Mur retiré',
    routeCleared: 'Direction effacée',
    routeSet: 'Direction : %s',
    centerCore: 'Centre (bloqué)',
    headPrefix: 'Tête',
    headActive: 'ACTIVE',
    headMuted: 'MUTÉE',
    stoppedInfo: 'Arrêté • Têtes au départ',
    gridCleared: 'Grille effacée',
    presetLoaded: 'Préréglage : %s',
    projectLoaded: 'Projet "%s" • %s BPM',
    exportedInfo: 'Fichier "%s.json" exporté',
    importedInfo: 'Projet "%s" importé',
    importError: 'Échec de l\'import du projet : %s',

    routeModalTitle: '🧭 Choisir une direction',
    routeModalDesc: 'Choisissez la direction des têtes sur cette case :',
    dirTL: 'Haut-Gauche',
    dirTR: 'Haut-Droite',
    dirL: 'Gauche',
    dirR: 'Droite',
    dirBL: 'Bas-Gauche',
    dirBR: 'Bas-Droite',
    removeRoute: '✕ Enlever la direction',
    done: 'OK',

    saveModalTitle: '💾 Enregistrer le projet',
    projectNameLabel: 'Nom du projet',
    projectNamePlaceholder: 'ex. Mon morceau',
    tempoLabel: 'Tempo :',
    cellsLabel: 'Cases :',
    cellsConfigured: 'actives',
    shareLinkBtn: '🔗 Partager le lien',
    exportFileBtn: '⬇ Exporter en JSON',
    saveProjectBtn: 'Enregistrer',

    loadModalTitle: '📁 Mes projets',
    savedGrooves: 'Morceaux enregistrés',
    importFileBtn: '⬆ Importer un fichier',
    noProjectsMsg: 'Aucun projet enregistré pour le moment.',
    loadBtn: '▶ Ouvrir',
    shareBtnTitle: 'Partager le lien',
    exportBtnTitle: 'Télécharger en fichier JSON',
    deleteBtnTitle: 'Supprimer',
    deleteConfirm: 'Supprimer le projet "%s" ?',
    closeBtn: 'Fermer',

    shareCopiedToast: '🔗 Lien copié !',
    shareSuccessToast: 'Projet partagé avec succès !',
    copyPrompt: 'Copiez le lien de votre morceau :',
    routeRemovedToast: 'Direction retirée de la case (%s, %s)',
    sharedLoadedToast: '🔗 Morceau chargé : "%s"',

    tutorialTitle: '🎓 Comment ça marche ?',
    tabConcept: '1. Concept',
    tabHeads: '2. Instruments',
    tabCellsWalls: '3. Sons & Murs',
    tabRouting: '4. Directions',
    tabShare: '5. Partager',
    btnPrev: '← Précédent',
    btnNext: 'Suivant →',
    btnStart: '🚀 C\'est parti !'
  }
};

let currentLocale: Locale = (() => {
  try {
    const saved = localStorage.getItem('hexabeat_lang') as Locale | null;
    if (saved === 'en' || saved === 'fr') return saved;
    if (navigator.language && navigator.language.toLowerCase().startsWith('fr')) {
      return 'fr';
    }
  } catch {}
  return 'en';
})();

export function getLocale(): Locale {
  return currentLocale;
}

export function setLocale(locale: Locale): void {
  currentLocale = locale;
  try {
    localStorage.setItem('hexabeat_lang', locale);
  } catch {}
}

export function t<K extends keyof Translations>(key: K): string {
  const dict = TRANSLATIONS[currentLocale] || TRANSLATIONS.en;
  return dict[key] || TRANSLATIONS.en[key] || (key as string);
}

export function formatString(template: string, ...args: any[]): string {
  let idx = 0;
  return template.replace(/%s/g, () => (args[idx++] !== undefined ? `${args[idx - 1]}` : ''));
}
