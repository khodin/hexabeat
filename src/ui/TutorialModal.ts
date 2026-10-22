import { getLocale } from '../i18n/translations';

export interface TutorialCallbacks {
  onOpenAcademy?: () => void;
  onPlayDirectly?: () => void;
}

export class TutorialModal {
  private modal: HTMLDivElement | null;
  private currentSlide: number = 0;
  private readonly totalSlides = 5;
  private callbacks?: TutorialCallbacks;

  constructor() {
    this.modal = document.getElementById('modal-tutorial') as HTMLDivElement | null;
    this.initEvents();
  }

  public setCallbacks(callbacks: TutorialCallbacks) {
    this.callbacks = callbacks;
  }

  private initEvents() {
    const btnClose = document.getElementById('btn-close-tutorial-modal');
    const btnDone = document.getElementById('btn-tutorial-done');
    const btnPrev = document.getElementById('btn-tutorial-prev');
    const btnNext = document.getElementById('btn-tutorial-next');
    const tabs = document.querySelectorAll('.tutorial-tab');

    btnClose?.addEventListener('click', () => this.hide());

    btnDone?.addEventListener('click', () => {
      this.hide();
      if (this.currentSlide === this.totalSlides - 1) {
        this.callbacks?.onPlayDirectly?.();
      }
    });

    btnPrev?.addEventListener('click', () => {
      if (this.currentSlide > 0) {
        this.goToSlide(this.currentSlide - 1);
      }
    });

    btnNext?.addEventListener('click', () => {
      if (this.currentSlide < this.totalSlides - 1) {
        this.goToSlide(this.currentSlide + 1);
      } else {
        this.hide();
        this.callbacks?.onOpenAcademy?.();
      }
    });

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => {
        this.goToSlide(index);
      });
    });
  }

  public show() {
    if (!this.modal) return;
    this.goToSlide(0);
    this.modal.classList.remove('hidden');
    const tabsContainer = document.querySelector('.tutorial-tabs');
    if (tabsContainer) tabsContainer.scrollTo({ left: 0, behavior: 'instant' });
    try {
      localStorage.setItem('hexabeat_tutorial_seen', 'true');
    } catch {}
  }

  public hide() {
    if (!this.modal) return;
    this.modal.classList.add('hidden');
  }

  public isOpen(): boolean {
    return !!this.modal && !this.modal.classList.contains('hidden');
  }

  public shouldAutoShow(): boolean {
    try {
      return localStorage.getItem('hexabeat_tutorial_seen') !== 'true';
    } catch {
      return false;
    }
  }

  public goToSlide(index: number) {
    this.currentSlide = Math.max(0, Math.min(this.totalSlides - 1, index));
    this.renderSlideContent();
  }

  public renderSlideContent() {
    const isFr = getLocale() === 'fr';
    const bodyEl = document.getElementById('tutorial-slide-body');
    const tabs = document.querySelectorAll('.tutorial-tab');
    const btnPrev = document.getElementById('btn-tutorial-prev') as HTMLButtonElement | null;
    const btnNext = document.getElementById('btn-tutorial-next') as HTMLButtonElement | null;
    const btnDone = document.getElementById('btn-tutorial-done') as HTMLButtonElement | null;

    if (!bodyEl) return;

    // Update tab indicators and smoothly ensure active tab is in view
    const tabsContainer = document.querySelector('.tutorial-tabs');
    tabs.forEach((tab, i) => {
      if (i === this.currentSlide) {
        tab.classList.add('active');
        if (tabsContainer) {
          const tabEl = tab as HTMLElement;
          const containerEl = tabsContainer as HTMLElement;
          const tabLeft = tabEl.offsetLeft;
          const tabRight = tabLeft + tabEl.offsetWidth;
          const containerLeft = containerEl.scrollLeft;
          const containerRight = containerLeft + containerEl.clientWidth;

          if (tabLeft < containerLeft) {
            containerEl.scrollTo({ left: Math.max(0, tabLeft - 12), behavior: 'smooth' });
          } else if (tabRight > containerRight) {
            containerEl.scrollTo({ left: tabRight - containerEl.clientWidth + 12, behavior: 'smooth' });
          }
        }
      } else {
        tab.classList.remove('active');
      }
    });

    // Update buttons
    if (btnPrev) {
      btnPrev.disabled = this.currentSlide === 0;
      btnPrev.style.display = this.currentSlide === 0 ? 'none' : '';
      btnPrev.textContent = isFr ? '← Précédent' : '← Previous';
    }

    if (btnNext) {
      if (this.currentSlide === this.totalSlides - 1) {
        btnNext.textContent = isFr ? '🎓 Apprendre avec l\'Académie' : '🎓 Learn with Academy';
        btnNext.classList.add('btn-primary');
      } else {
        btnNext.textContent = isFr ? 'Suivant →' : 'Next →';
        btnNext.classList.remove('btn-primary');
      }
    }

    if (btnDone) {
      if (this.currentSlide === this.totalSlides - 1) {
        btnDone.textContent = isFr ? '🎛️ Jouer directement' : '🎛️ Play directly';
      } else {
        btnDone.textContent = isFr ? 'Fermer' : 'Close';
      }
    }

    // Render Slide Content
    switch (this.currentSlide) {
      case 0:
        // Slide 1: Concept
        bodyEl.innerHTML = isFr ? `
          <div class="tut-slide">
            <div class="tut-icon-hero">⬡</div>
            <h4 class="tut-title">Le Séquenceur Hexagonal</h4>
            <p class="tut-p">
              Inspiré de <strong>JR Hexatone Pro</strong>, HexaBeat est un séquenceur rythmique sur une grille hexagonale de <strong>91 cases</strong>.
            </p>
            <div class="tut-card-grid">
              <div class="tut-badge-card">
                <span class="tut-badge-icon">🎯</span>
                <div>
                  <strong>6 directions</strong>
                  <p>Les têtes de lecture avancent dans 6 directions et rebondissent sur les bords.</p>
                </div>
              </div>
              <div class="tut-badge-card">
                <span class="tut-badge-icon">⏱</span>
                <div>
                  <strong>Au tempo (BPM)</strong>
                  <p>À chaque battement, les têtes actives avancent d'une case.</p>
                </div>
              </div>
            </div>
          </div>
        ` : `
          <div class="tut-slide">
            <div class="tut-icon-hero">⬡</div>
            <h4 class="tut-title">The Hexagonal Sequencer</h4>
            <p class="tut-p">
              Inspired by <strong>JR Hexatone Pro</strong>, HexaBeat is a generative rhythm sequencer on a <strong>91-cell</strong> hexagonal grid.
            </p>
            <div class="tut-card-grid">
              <div class="tut-badge-card">
                <span class="tut-badge-icon">🎯</span>
                <div>
                  <strong>6 Directions</strong>
                  <p>Playheads move in 6 directions and bounce off edges.</p>
                </div>
              </div>
              <div class="tut-badge-card">
                <span class="tut-badge-icon">⏱</span>
                <div>
                  <strong>Tempo Locked (BPM)</strong>
                  <p>On each beat, active playheads advance one cell.</p>
                </div>
              </div>
            </div>
          </div>
        `;
        break;

      case 1:
        // Slide 2: Playheads & Instruments
        bodyEl.innerHTML = isFr ? `
          <div class="tut-slide">
            <h4 class="tut-title">6 Têtes de Lecture & Instruments</h4>
            <p class="tut-p">
              Le cœur central héberge 6 têtes de lecture autour de lui. Touchez une baie pour l'activer ou la couper :
            </p>
            <div class="tut-card-grid">
              <div class="tut-badge-card">
                <span class="tut-badge-icon" style="color: #00ffff">⬢</span>
                <div>
                  <strong>Alpha (Cyan)</strong>
                  <p>Grosse caisse (Kick) percutante.</p>
                </div>
              </div>
              <div class="tut-badge-card">
                <span class="tut-badge-icon" style="color: #ff007f">⬢</span>
                <div>
                  <strong>Beta (Rose)</strong>
                  <p>Caisse claire (Snare) claquante.</p>
                </div>
              </div>
              <div class="tut-badge-card">
                <span class="tut-badge-icon" style="color: #39ff14">⬢</span>
                <div>
                  <strong>Gamma (Vert)</strong>
                  <p>Charleston fermé (Closed Hat).</p>
                </div>
              </div>
              <div class="tut-badge-card">
                <span class="tut-badge-icon" style="color: #ffe600">⬢</span>
                <div>
                  <strong>Delta (Jaune)</strong>
                  <p>Charleston ouvert (Open Hat).</p>
                </div>
              </div>
              <div class="tut-badge-card">
                <span class="tut-badge-icon" style="color: #a855f7">⬢</span>
                <div>
                  <strong>Epsilon (Violet)</strong>
                  <p>Clap / Percussion.</p>
                </div>
              </div>
              <div class="tut-badge-card">
                <span class="tut-badge-icon" style="color: #ff6b2b">⬢</span>
                <div>
                  <strong>Zeta (Orange)</strong>
                  <p>Synthétiseur mélodique pentatonique.</p>
                </div>
              </div>
            </div>
          </div>
        ` : `
          <div class="tut-slide">
            <h4 class="tut-title">6 Playheads & Instruments</h4>
            <p class="tut-p">
              The central core is surrounded by 6 departure bay pads. Tap any pad to arm or mute it:
            </p>
            <div class="tut-card-grid">
              <div class="tut-badge-card">
                <span class="tut-badge-icon" style="color: #00ffff">⬢</span>
                <div>
                  <strong>Alpha (Cyan)</strong>
                  <p>Deep electronic Kick drum.</p>
                </div>
              </div>
              <div class="tut-badge-card">
                <span class="tut-badge-icon" style="color: #ff007f">⬢</span>
                <div>
                  <strong>Beta (Pink)</strong>
                  <p>Snappy Snare drum.</p>
                </div>
              </div>
              <div class="tut-badge-card">
                <span class="tut-badge-icon" style="color: #39ff14">⬢</span>
                <div>
                  <strong>Gamma (Green)</strong>
                  <p>Crisp Closed Hi-Hat.</p>
                </div>
              </div>
              <div class="tut-badge-card">
                <span class="tut-badge-icon" style="color: #ffe600">⬢</span>
                <div>
                  <strong>Delta (Yellow)</strong>
                  <p>Sizzling Open Hi-Hat.</p>
                </div>
              </div>
              <div class="tut-badge-card">
                <span class="tut-badge-icon" style="color: #a855f7">⬢</span>
                <div>
                  <strong>Epsilon (Purple)</strong>
                  <p>Dynamic Handclap / Percussion.</p>
                </div>
              </div>
              <div class="tut-badge-card">
                <span class="tut-badge-icon" style="color: #ff6b2b">⬢</span>
                <div>
                  <strong>Zeta (Orange)</strong>
                  <p>Melodic Pentatonic Synth.</p>
                </div>
              </div>
            </div>
          </div>
        `;
        break;

      case 2:
        // Slide 3: Beats & Obstacle Walls
        bodyEl.innerHTML = isFr ? `
          <div class="tut-slide">
            <h4 class="tut-title">Cases Sons & Murs d'Obstacle</h4>
            <p class="tut-p">
              Utilisez la palette d'outils en bas pour peindre votre rythme :
            </p>
            <div class="tut-card-grid">
              <div class="tut-badge-card">
                <span class="tut-badge-icon">🎵</span>
                <div>
                  <strong>Outil Son [🎵]</strong>
                  <p>Active une case. Quand une tête la traverse, elle joue son instrument avec flash lumineux.</p>
                </div>
              </div>
              <div class="tut-badge-card">
                <span class="tut-badge-icon">🧱</span>
                <div>
                  <strong>Outil Mur [🧱]</strong>
                  <p>Pose un mur d'obstacle infranchissable qui fait rebondir les têtes de lecture.</p>
                </div>
              </div>
            </div>
            <div class="tut-callout">
              <strong>Astuce :</strong>
              <p>Glissez votre doigt ou la souris pour peindre plusieurs cases en un seul geste continu.</p>
            </div>
          </div>
        ` : `
          <div class="tut-slide">
            <h4 class="tut-title">Sound Beats & Obstacle Walls</h4>
            <p class="tut-p">
              Use the bottom toolbar to paint your rhythm layout:
            </p>
            <div class="tut-card-grid">
              <div class="tut-badge-card">
                <span class="tut-badge-icon">🎵</span>
                <div>
                  <strong>Beat Tool [🎵]</strong>
                  <p>Enables a sound cell. When any playhead hits it, it fires its dedicated sound.</p>
                </div>
              </div>
              <div class="tut-badge-card">
                <span class="tut-badge-icon">🧱</span>
                <div>
                  <strong>Wall Tool [🧱]</strong>
                  <p>Tap or drag to build obstacle walls that bounce playheads.</p>
                </div>
              </div>
            </div>
            <div class="tut-callout">
              <strong>Tip:</strong>
              <p>Drag your finger or cursor to paint multiple cells in one continuous swipe.</p>
            </div>
          </div>
        `;
        break;

      case 3:
        // Slide 4: Direction Stamps & Routing
        bodyEl.innerHTML = isFr ? `
          <div class="tut-slide">
            <h4 class="tut-title">Tampon de Direction</h4>
            <p class="tut-p">
              Par défaut, les têtes choisissent une direction aléatoire. Forcez leur trajectoire avec les flèches :
            </p>
            <div class="tut-card-grid">
              <div class="tut-badge-card">
                <span class="tut-badge-icon">↗</span>
                <div>
                  <strong>Outil Direction [↗]</strong>
                  <p>Applique la flèche active sur les cases pour guider les têtes dans des boucles précises.</p>
                </div>
              </div>
              <div class="tut-badge-card">
                <span class="tut-badge-icon">🧭</span>
                <div>
                  <strong>Changer la direction</strong>
                  <p>Touchez l'outil [↗] pour choisir parmi les 6 directions (ou touche R sur PC).</p>
                </div>
              </div>
            </div>
            <div class="tut-callout">
              <strong>Retirer une direction :</strong>
              <p>Re-cliquer sur une case ayant déjà la même flèche efface sa direction.</p>
            </div>
          </div>
        ` : `
          <div class="tut-slide">
            <h4 class="tut-title">Direction Stamp</h4>
            <p class="tut-p">
              By default, playheads move randomly. You can stamp directional tracks:
            </p>
            <div class="tut-card-grid">
              <div class="tut-badge-card">
                <span class="tut-badge-icon">↗</span>
                <div>
                  <strong>Stamp Tool [↗]</strong>
                  <p>Tap or drag across cells to stamp the active compass direction.</p>
                </div>
              </div>
              <div class="tut-badge-card">
                <span class="tut-badge-icon">🧭</span>
                <div>
                  <strong>Change Direction</strong>
                  <p>Tap the [↗] tool to pick from 6 directions (or press R on desktop).</p>
                </div>
              </div>
            </div>
            <div class="tut-callout">
              <strong>Remove direction:</strong>
              <p>Re-stamping a cell with its active arrow removes the direction.</p>
            </div>
          </div>
        `;
        break;

      case 4:
        // Slide 5: Saving, Sharing & Next Steps
        bodyEl.innerHTML = isFr ? `
          <div class="tut-slide">
            <h4 class="tut-title">Partager & Jouer</h4>
            <p class="tut-p">
              Vos morceaux peuvent être partagés par simple lien URL ou exportés en fichier <code>.json</code>.
            </p>
            <div class="tut-card-grid">
              <div class="tut-badge-card">
                <span class="tut-badge-icon">🔗</span>
                <div>
                  <strong>Partage Web & Mobile</strong>
                  <p>Copiez le lien URL du morceau ou sauvegardez-le dans votre navigateur.</p>
                </div>
              </div>
              <div class="tut-badge-card">
                <span class="tut-badge-icon">🎓</span>
                <div>
                  <strong>L'Académie HexaBeat</strong>
                  <p>5 défis courts guidés pas à pas pour maîtriser chaque outil et gagner 3 étoiles.</p>
                </div>
              </div>
            </div>
            <div class="tut-callout">
              <strong>Prêt à commencer ?</strong>
              <p>Apprenez pas à pas avec les défis de l'Académie ou commencez à composer directement dans le Studio !</p>
            </div>
          </div>
        ` : `
          <div class="tut-slide">
            <h4 class="tut-title">Share & Play</h4>
            <p class="tut-p">
              Your tracks can be shared with a simple URL link or exported as <code>.json</code> files.
            </p>
            <div class="tut-card-grid">
              <div class="tut-badge-card">
                <span class="tut-badge-icon">🔗</span>
                <div>
                  <strong>Web & Mobile Sharing</strong>
                  <p>Copy the track URL or save your creations in your browser storage.</p>
                </div>
              </div>
              <div class="tut-badge-card">
                <span class="tut-badge-icon">🎓</span>
                <div>
                  <strong>HexaBeat Academy</strong>
                  <p>5 bite-sized interactive challenges to master every tool and earn 3 stars.</p>
                </div>
              </div>
            </div>
            <div class="tut-callout">
              <strong>Ready to roll?</strong>
              <p>Learn step-by-step with Academy challenges or dive right into the Studio to make music!</p>
            </div>
          </div>
        `;
        break;
    }
  }
}
