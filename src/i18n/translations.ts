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
  toolBeat: string;
  toolWall: string;
  toolRoute: string;
  stampDirChanged: string;
  hintBeatTool: string;
  hintWallTool: string;
  hintRouteTool: string;

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

  // Academy & Guided Quests
  btnAcademy: string;
  academyTitle: string;
  academySubtitle: string;
  questBadge: string;
  questResetBtn: string;
  questQuitBtn: string;
  questNextBtn: string;
  questContinueStudioBtn: string;
  questVictoryTitle: string;
  questVictorySubtitle: string;
  questVictoryStars3: string;
  questVictoryStars2: string;
  questVictoryStars1: string;
  questStarsGoalBadge: string;
  questPlayBtn: string;
  questStatusLocked: string;
  questStatusUnlocked: string;
  questStatusCompleted: string;

  quest1Title: string;
  quest1Desc: string;
  quest1Goal: string;

  quest2Title: string;
  quest2Desc: string;
  quest2Goal: string;

  quest3Title: string;
  quest3Desc: string;
  quest3Goal: string;

  quest4Title: string;
  quest4Desc: string;
  quest4Goal: string;

  quest5Title: string;
  quest5Desc: string;
  quest5Goal: string;
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
    btnRoute: 'Direction',
    btnRouteWithDir: 'Direction: %s',
    btnClearRoute: 'Clear',
    stepPrefix: 'Step: %s',
    toolBeat: 'Beat',
    toolWall: 'Wall',
    toolRoute: 'Direction',
    stampDirChanged: 'Direction stamp: %s',
    hintBeatTool: 'Beat tool • Tap or drag to place sounds',
    hintWallTool: 'Wall tool • Tap or drag to place walls',
    hintRouteTool: 'Direction stamp (%s) • Tap to stamp, click tool to change',

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

    tutorialTitle: '🎓 How It Works',
    tabConcept: '1. Concept',
    tabHeads: '2. Instruments',
    tabCellsWalls: '3. Beats & Walls',
    tabRouting: '4. Directions',
    tabShare: '5. Share',
    btnPrev: '← Previous',
    btnNext: 'Next →',
    btnStart: '🚀 Start Jamming!',

    btnAcademy: 'Academy',
    academyTitle: '🎓 HexaBeat Academy',
    academySubtitle: 'Master groove architecture step by step through interactive challenges',
    questBadge: 'Quest %s/%s',
    questResetBtn: '↺ Reset',
    questQuitBtn: '✕ Studio',
    questNextBtn: 'Next Quest ▶',
    questContinueStudioBtn: 'Keep Jamming in Studio 🎛️',
    questVictoryTitle: 'Quest Completed! 🎉',
    questVictorySubtitle: 'Outstanding! You mastered this technique.',
    questVictoryStars3: 'Flawless! Target reached in %s steps with zero extra cells.',
    questVictoryStars2: 'Well done! Cleared in %s steps. Can you optimize the path with no extra cells?',
    questVictoryStars1: 'Completed in %s steps! Try a more direct path and remove unnecessary cells.',
    questStarsGoalBadge: '3★: ≤%s steps',
    questPlayBtn: '▶ Play',
    questStatusLocked: 'Locked',
    questStatusUnlocked: 'Ready',
    questStatusCompleted: 'Completed ⭐',

    quest1Title: '1. The First Beat',
    quest1Desc: 'Place a sound on the glowing cell and press Play to trigger your first kick.',
    quest1Goal: 'First beat: %s/%s',

    quest2Title: '2. Echo Bounce',
    quest2Desc: 'Select the Wall tool [🧱] below, place the 3 walls on the crimson cells, then press Play ▶ to hear 4 bounces.',
    quest2Goal: 'Bounces: %s/%s',

    quest3Title: '3. Infinite Orbit',
    quest3Desc: 'Route the 3 golden cells with Direction arrows, then press Play ▶ to complete 1 full loop around the center (12 steps).',
    quest3Goal: 'Full loop: %s/%s steps',

    quest4Title: '4. Kick & Snare Duo',
    quest4Desc: "Tap the pink pad (0, 1) to wake up Beta, place a beat on (0, 2), then press Play ▶ to hear 4 kicks and 4 snares.",
    quest4Goal: 'Kicks: %s/%s • Snares: %s/%s',

    quest5Title: '5. Spatial Melody',
    quest5Desc: 'Place beats on the 3 melodic chamber cells, then press Play ▶ to hear all 3 unique notes.',
    quest5Goal: 'Unique notes: %s/%s'
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
    toolBeat: 'Son',
    toolWall: 'Mur',
    toolRoute: 'Direction',
    stampDirChanged: 'Tampon direction : %s',
    hintBeatTool: 'Outil Son • Touchez ou glissez pour activer des sons',
    hintWallTool: 'Outil Mur • Touchez ou glissez pour placer des murs',
    hintRouteTool: 'Tampon Direction (%s) • Touchez pour orienter, re-cliquez pour changer',

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
    btnStart: '🚀 C\'est parti !',

    btnAcademy: 'Académie',
    academyTitle: '🎓 L\'Académie HexaBeat',
    academySubtitle: 'Maîtrise l\'architecture du groove pas à pas à travers des défis pratiques',
    questBadge: 'Défi %s/%s',
    questResetBtn: '↺ Recommencer',
    questQuitBtn: '✕ Studio',
    questNextBtn: 'Défi Suivant ▶',
    questContinueStudioBtn: 'Continuer dans le Studio 🎛️',
    questVictoryTitle: 'Défi Réussi ! 🎉',
    questVictorySubtitle: 'Bravo ! Tu maîtrises cette mécanique.',
    questVictoryStars3: 'Parfait ! Objectif atteint en %s pas sans case superflue.',
    questVictoryStars2: 'Bien joué ! Validé en %s pas. Peux-tu optimiser le chemin sans case superflue ?',
    questVictoryStars1: 'Réussi en %s pas ! Essaie un chemin plus direct et retire les cases superflues.',
    questStarsGoalBadge: '3★ : ≤%s pas',
    questPlayBtn: '▶ Jouer',
    questStatusLocked: 'Verrouillé',
    questStatusUnlocked: 'Disponible',
    questStatusCompleted: 'Terminé ⭐',

    quest1Title: '1. Le Premier Battement',
    quest1Desc: 'Place un son sur la case clignotante et appuie sur Lecture ▶ pour déclencher ton premier battement.',
    quest1Goal: 'Premier battement : %s/%s',

    quest2Title: '2. L\'Écho du Rebond',
    quest2Desc: 'Sélectionne l\'outil Mur [🧱] en bas, pose les 3 murs sur les cases rouges, puis appuie sur Lecture ▶ pour valider 4 rebonds.',
    quest2Goal: 'Rebonds : %s/%s',

    quest3Title: '3. L\'Orbite Infinie',
    quest3Desc: 'Oriente les 3 cases dorées avec les flèches de Direction, puis appuie sur Lecture ▶ pour qu\'Alpha boucle 1 tour complet (12 pas).',
    quest3Goal: 'Tour complet : %s/%s pas',

    quest4Title: '4. Le Duo Poum-Tchak',
    quest4Desc: 'Touche la baie rose (0, 1) pour réveiller Beta, pose un son sur (0, 2), puis appuie sur Lecture ▶ pour entendre 4 kicks et 4 snares.',
    quest4Goal: 'Kicks : %s/%s • Snares : %s/%s',

    quest5Title: '5. La Mélodie Spatiale',
    quest5Desc: 'Pose des sons sur les 3 cases de la chambre mélodique, puis appuie sur Lecture ▶ pour entendre les 3 notes uniques.',
    quest5Goal: 'Notes uniques : %s/%s'
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

export function formatString(template: string, ...args: unknown[]): string {
  let idx = 0;
  return template.replace(/%s/g, () => (args[idx++] !== undefined ? String(args[idx - 1]) : ''));
}
