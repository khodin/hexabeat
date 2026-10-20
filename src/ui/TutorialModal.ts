import { getLocale } from '../i18n/translations';

export class TutorialModal {
  private modal: HTMLDivElement | null;
  private currentSlide: number = 0;
  private readonly totalSlides = 5;

  constructor() {
    this.modal = document.getElementById('modal-tutorial') as HTMLDivElement | null;
    this.initEvents();
  }

  private initEvents() {
    const btnClose = document.getElementById('btn-close-tutorial-modal');
    const btnDone = document.getElementById('btn-tutorial-done');
    const btnPrev = document.getElementById('btn-tutorial-prev');
    const btnNext = document.getElementById('btn-tutorial-next');
    const tabs = document.querySelectorAll('.tutorial-tab');

    btnClose?.addEventListener('click', () => this.hide());
    btnDone?.addEventListener('click', () => this.hide());

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
        btnNext.textContent = isFr ? '🚀 C\'est parti !' : '🚀 Start Jamming!';
        btnNext.classList.add('btn-primary');
      } else {
        btnNext.textContent = isFr ? 'Suivant →' : 'Next →';
        btnNext.classList.remove('btn-primary');
      }
    }

    if (btnDone) {
      btnDone.textContent = isFr ? 'Fermer' : 'Close';
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
              Inspired by <strong>JR Hexatone Pro</strong>, HexaBeat is a rhythm sequencer on a <strong>91-cell</strong> hexagonal grid.
            </p>
            <div class="tut-card-grid">
              <div class="tut-badge-card">
                <span class="tut-badge-icon">🎯</span>
                <div>
                  <strong>6 directions</strong>
                  <p>Playheads move in 6 directions and bounce off edges.</p>
                </div>
              </div>
              <div class="tut-badge-card">
                <span class="tut-badge-icon">⏱</span>
                <div>
                  <strong>On tempo (BPM)</strong>
                  <p>On every beat, active playheads advance by one cell.</p>
                </div>
              </div>
            </div>
          </div>
        `;
        break;

      case 1:
        // Slide 2: The 6 Playheads & Instruments
        bodyEl.innerHTML = isFr ? `
          <div class="tut-slide">
            <h4 class="tut-title">Les 6 têtes & instruments</h4>
            <p class="tut-p">
              Les 6 têtes partent du premier cercle autour du centre, chacune avec son son :
            </p>
            <div class="tut-heads-list">
              <div class="tut-head-row" style="--hcolor: #00ffff">
                <span class="tut-head-num">1</span>
                <span class="tut-head-name">Kick</span>
                <span class="tut-head-desc">Grosse caisse</span>
              </div>
              <div class="tut-head-row" style="--hcolor: #ff007f">
                <span class="tut-head-num">2</span>
                <span class="tut-head-name">Snare</span>
                <span class="tut-head-desc">Caisse claire</span>
              </div>
              <div class="tut-head-row" style="--hcolor: #39ff14">
                <span class="tut-head-num">3</span>
                <span class="tut-head-name">Closed Hat</span>
                <span class="tut-head-desc">Charleston fermé</span>
              </div>
              <div class="tut-head-row" style="--hcolor: #ffe600">
                <span class="tut-head-num">4</span>
                <span class="tut-head-name">Open Hat</span>
                <span class="tut-head-desc">Charleston ouvert</span>
              </div>
              <div class="tut-head-row" style="--hcolor: #a855f7">
                <span class="tut-head-num">5</span>
                <span class="tut-head-name">Clap</span>
                <span class="tut-head-desc">Battement de mains</span>
              </div>
              <div class="tut-head-row" style="--hcolor: #ff6b2b">
                <span class="tut-head-num">6</span>
                <span class="tut-head-name">Synth</span>
                <span class="tut-head-desc">Synthétiseur mélodique</span>
              </div>
            </div>
            <p class="tut-tip">
              💡 <strong>Astuce :</strong> Touchez les cases 1 à 6 au centre pour activer ou couper une tête.
            </p>
          </div>
        ` : `
          <div class="tut-slide">
            <h4 class="tut-title">The 6 Playheads & Sounds</h4>
            <p class="tut-p">
              The 6 playheads start from the first circle around the center, each with its own sound:
            </p>
            <div class="tut-heads-list">
              <div class="tut-head-row" style="--hcolor: #00ffff">
                <span class="tut-head-num">1</span>
                <span class="tut-head-name">Kick</span>
                <span class="tut-head-desc">Bass drum</span>
              </div>
              <div class="tut-head-row" style="--hcolor: #ff007f">
                <span class="tut-head-num">2</span>
                <span class="tut-head-name">Snare</span>
                <span class="tut-head-desc">Snare drum</span>
              </div>
              <div class="tut-head-row" style="--hcolor: #39ff14">
                <span class="tut-head-num">3</span>
                <span class="tut-head-name">Closed Hat</span>
                <span class="tut-head-desc">Closed hi-hat</span>
              </div>
              <div class="tut-head-row" style="--hcolor: #ffe600">
                <span class="tut-head-num">4</span>
                <span class="tut-head-name">Open Hat</span>
                <span class="tut-head-desc">Open hi-hat</span>
              </div>
              <div class="tut-head-row" style="--hcolor: #a855f7">
                <span class="tut-head-num">5</span>
                <span class="tut-head-name">Clap</span>
                <span class="tut-head-desc">Handclap</span>
              </div>
              <div class="tut-head-row" style="--hcolor: #ff6b2b">
                <span class="tut-head-num">6</span>
                <span class="tut-head-name">Synth</span>
                <span class="tut-head-desc">Melodic synth</span>
              </div>
            </div>
            <p class="tut-tip">
              💡 <strong>Tip:</strong> Tap cells 1 to 6 in the center to enable or mute a playhead.
            </p>
          </div>
        `;
        break;

      case 2:
        // Slide 3: Beats & Walls
        bodyEl.innerHTML = isFr ? `
          <div class="tut-slide">
            <h4 class="tut-title">Outils Sons & Murs</h4>
            <p class="tut-p">
              Utilisez la palette d'outils en bas pour composer sur la grille :
            </p>
            <div class="tut-card-grid">
              <div class="tut-badge-card">
                <span class="tut-badge-icon">🎵</span>
                <div>
                  <strong>Outil Son [🎵]</strong>
                  <p>Touchez ou glissez pour activer ou éteindre des sons sur les cases.</p>
                </div>
              </div>
              <div class="tut-badge-card">
                <span class="tut-badge-icon">🧱</span>
                <div>
                  <strong>Outil Mur [🧱]</strong>
                  <p>Touchez ou tracez des murs d'obstacles pour faire rebondir les têtes.</p>
                </div>
              </div>
            </div>
            <div class="tut-callout">
              <strong>Créer des rythmes :</strong>
              <p>Placez des murs pour créer des boucles fermées et des polyrythmies régulières.</p>
            </div>
          </div>
        ` : `
          <div class="tut-slide">
            <h4 class="tut-title">Beat & Wall Tools</h4>
            <p class="tut-p">
              Use the bottom tool palette to compose directly on the grid:
            </p>
            <div class="tut-card-grid">
              <div class="tut-badge-card">
                <span class="tut-badge-icon">🎵</span>
                <div>
                  <strong>Beat Tool [🎵]</strong>
                  <p>Tap or drag across cells to toggle rhythm notes on or off.</p>
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
              <strong>Create rhythms:</strong>
              <p>Place walls to create loops and repeatable polyrhythms.</p>
            </div>
          </div>
        `;
        break;

      case 3:
        // Slide 4: Directional Routing (Stamp Tool)
        bodyEl.innerHTML = isFr ? `
          <div class="tut-slide">
            <h4 class="tut-title">Tampon de Direction</h4>
            <p class="tut-p">
              Par défaut, les têtes se déplacent de façon aléatoire. Vous pouvez forcer leur route :
            </p>
            <div class="tut-card-grid">
              <div class="tut-badge-card">
                <span class="tut-badge-icon">↗</span>
                <div>
                  <strong>Outil Tampon [↗]</strong>
                  <p>Chaque case touchée ou tracée reçoit directement la direction sélectionnée.</p>
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
        // Slide 5: Saving & URL Sharing
        bodyEl.innerHTML = isFr ? `
          <div class="tut-slide">
            <h4 class="tut-title">Partager & sauvegarder</h4>
            <p class="tut-p">
              Vos morceaux peuvent être partagés par simple lien URL :
            </p>
            <div class="tut-card-grid">
              <div class="tut-badge-card">
                <span class="tut-badge-icon">🔗</span>
                <div>
                  <strong>Bouton [🔗]</strong>
                  <p>Copie le lien du morceau ou ouvre le menu de partage sur mobile.</p>
                </div>
              </div>
              <div class="tut-badge-card">
                <span class="tut-badge-icon">💾</span>
                <div>
                  <strong>Boutons [💾] & [📁]</strong>
                  <p>Enregistrez vos morceaux dans le navigateur ou exportez-les en fichier <code>.json</code>.</p>
                </div>
              </div>
            </div>
            <div class="tut-callout">
              <strong>À vous de jouer :</strong>
              <p>Testez les préréglages (Polyrythmie, IDM) ou créez votre propre rythme.</p>
            </div>
          </div>
        ` : `
          <div class="tut-slide">
            <h4 class="tut-title">Share & Save</h4>
            <p class="tut-p">
              Your tracks can be shared with a simple URL link:
            </p>
            <div class="tut-card-grid">
              <div class="tut-badge-card">
                <span class="tut-badge-icon">🔗</span>
                <div>
                  <strong>[🔗] Button</strong>
                  <p>Copies the track link or opens the share menu on mobile.</p>
                </div>
              </div>
              <div class="tut-badge-card">
                <span class="tut-badge-icon">💾</span>
                <div>
                  <strong>[💾] & [📁] Buttons</strong>
                  <p>Save tracks in your browser or export them as <code>.json</code> files.</p>
                </div>
              </div>
            </div>
            <div class="tut-callout">
              <strong>Your turn:</strong>
              <p>Try the presets (Hex Polyrhythm, IDM Generative) or build your own groove.</p>
            </div>
          </div>
        `;
        break;
    }
  }
}
