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
    this.renderSlideContent();
    this.modal.classList.remove('hidden');
    try {
      localStorage.setItem('hexabeat_tutorial_seen', 'true');
    } catch {}
  }

  public hide() {
    if (!this.modal) return;
    this.modal.classList.add('hidden');
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

    // Update tab indicators
    tabs.forEach((tab, i) => {
      if (i === this.currentSlide) {
        tab.classList.add('active');
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
        btnNext.textContent = isFr ? '🚀 Commencer !' : '🚀 Start Jamming!';
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
              Inspiré du célèbre <strong>JR Hexatone Pro</strong>, HexaBeat transforme une ruche géométrique de <strong>91 cases</strong> en boîte à rythmes et instrument génératif.
            </p>
            <div class="tut-card-grid">
              <div class="tut-badge-card">
                <span class="tut-badge-icon">🎯</span>
                <div>
                  <strong>6 Directions</strong>
                  <p>Les impulsions rythmiques se déplacent dans 6 angles (60°) et rebondissent sur les parois.</p>
                </div>
              </div>
              <div class="tut-badge-card">
                <span class="tut-badge-icon">⏱</span>
                <div>
                  <strong>Synchronisation au Tempo</strong>
                  <p>À chaque battement d'horloge (BPM), chaque tête active avance d'une case dans sa direction.</p>
                </div>
              </div>
            </div>
          </div>
        ` : `
          <div class="tut-slide">
            <div class="tut-icon-hero">⬡</div>
            <h4 class="tut-title">The Hexagonal Sequencer</h4>
            <p class="tut-p">
              Inspired by the classic <strong>JR Hexatone Pro</strong>, HexaBeat turns a dense <strong>91-cell honeycomb</strong> into a physical generative rhythm workstation.
            </p>
            <div class="tut-card-grid">
              <div class="tut-badge-card">
                <span class="tut-badge-icon">🎯</span>
                <div>
                  <strong>6-Compass Physics</strong>
                  <p>Rhythm playheads move at 60° angles and physically bounce off perimeter walls and obstacles.</p>
                </div>
              </div>
              <div class="tut-badge-card">
                <span class="tut-badge-icon">⏱</span>
                <div>
                  <strong>Tempo Synchronized</strong>
                  <p>On every clock step (BPM), all active playheads move forward to their next hexagonal node.</p>
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
            <h4 class="tut-title">Les 6 Têtes & Instruments</h4>
            <p class="tut-p">
              Chaque tête de lecture part de son propre socle sur le premier cercle autour du centre et possède un son exclusif :
            </p>
            <div class="tut-heads-list">
              <div class="tut-head-row" style="--hcolor: #00ffff">
                <span class="tut-head-num">1</span>
                <span class="tut-head-name">Grosse Caisse (Kick)</span>
                <span class="tut-head-desc">Sub basse percutante</span>
              </div>
              <div class="tut-head-row" style="--hcolor: #ff007f">
                <span class="tut-head-num">2</span>
                <span class="tut-head-name">Caisse Claire (Snare)</span>
                <span class="tut-head-desc">Impact sec et claquant</span>
              </div>
              <div class="tut-head-row" style="--hcolor: #39ff14">
                <span class="tut-head-num">3</span>
                <span class="tut-head-name">Charleston Fermé (Closed Hat)</span>
                <span class="tut-head-desc">Tic-tac précis à haute fréquence</span>
              </div>
              <div class="tut-head-row" style="--hcolor: #ffe600">
                <span class="tut-head-num">4</span>
                <span class="tut-head-name">Charleston Ouvert (Open Hat)</span>
                <span class="tut-head-desc">Sifflement brillant de cymbale</span>
              </div>
              <div class="tut-head-row" style="--hcolor: #a855f7">
                <span class="tut-head-num">5</span>
                <span class="tut-head-name">Clap (Clappement)</span>
                <span class="tut-head-desc">Claque électro texturée</span>
              </div>
              <div class="tut-head-row" style="--hcolor: #ff6b2b">
                <span class="tut-head-num">6</span>
                <span class="tut-head-name">Synthétiseur (Synth)</span>
                <span class="tut-head-desc">Notes mélodiques selon les coordonnées</span>
              </div>
            </div>
            <p class="tut-tip">
              💡 <strong>Astuce :</strong> Touchez les cercles numérotés 1 à 6 autour du centre pour allumer ou couper chaque tête !
            </p>
          </div>
        ` : `
          <div class="tut-slide">
            <h4 class="tut-title">The 6 Playheads & Sounds</h4>
            <p class="tut-p">
              Each playhead departs outward from its dedicated pad on the circle around the center with a unique procedural sound:
            </p>
            <div class="tut-heads-list">
              <div class="tut-head-row" style="--hcolor: #00ffff">
                <span class="tut-head-num">1</span>
                <span class="tut-head-name">Bass Drum (Kick)</span>
                <span class="tut-head-desc">Punchy electronic sub kick</span>
              </div>
              <div class="tut-head-row" style="--hcolor: #ff007f">
                <span class="tut-head-num">2</span>
                <span class="tut-head-name">Snare Drum</span>
                <span class="tut-head-desc">Tight cracking rimshot snare</span>
              </div>
              <div class="tut-head-row" style="--hcolor: #39ff14">
                <span class="tut-head-num">3</span>
                <span class="tut-head-name">Closed Hi-Hat</span>
                <span class="tut-head-desc">Crisp high-frequency clocking</span>
              </div>
              <div class="tut-head-row" style="--hcolor: #ffe600">
                <span class="tut-head-num">4</span>
                <span class="tut-head-name">Open Hi-Hat</span>
                <span class="tut-head-desc">Metallic offbeat sizzle</span>
              </div>
              <div class="tut-head-row" style="--hcolor: #a855f7">
                <span class="tut-head-num">5</span>
                <span class="tut-head-name">Handclap</span>
                <span class="tut-head-desc">Multi-layered analog clap</span>
              </div>
              <div class="tut-head-row" style="--hcolor: #ff6b2b">
                <span class="tut-head-num">6</span>
                <span class="tut-head-name">Lead Synth</span>
                <span class="tut-head-desc">Melodic pitch mapped to cell position</span>
              </div>
            </div>
            <p class="tut-tip">
              💡 <strong>Tip:</strong> Tap any departure pad (1 to 6) around the center to toggle that playhead ON or OFF!
            </p>
          </div>
        `;
        break;

      case 2:
        // Slide 3: Beats & Walls
        bodyEl.innerHTML = isFr ? `
          <div class="tut-slide">
            <h4 class="tut-title">Activer les Sons & Placer des Murs</h4>
            <div class="tut-card-grid">
              <div class="tut-badge-card">
                <span class="tut-badge-icon">👆</span>
                <div>
                  <strong>Toucher une case : Son On / Off</strong>
                  <p>Touchez n'importe quelle case de la ruche pour l'activer en <strong>cyan néon</strong>. Dès qu'une tête la traverse, son instrument retentit !</p>
                </div>
              </div>
              <div class="tut-badge-card">
                <span class="tut-badge-icon">🧱</span>
                <div>
                  <strong>Bouton [Mur] : Obstacle Physique</strong>
                  <p>Sélectionnez une case puis touchez le bouton <strong>[🧱 Mur]</strong> dans la barre du bas. La case devient un mur infranchissable rouge cramoisi.</p>
                </div>
              </div>
            </div>
            <div class="tut-callout">
              <strong>Sculptez le Rythme :</strong>
              <p>Les têtes rebondissent physiquement contre les murs ! Placez des murs stratégiques pour créer des allers-retours réguliers et des cadences hypnotiques.</p>
            </div>
          </div>
        ` : `
          <div class="tut-slide">
            <h4 class="tut-title">Toggle Beats & Build Walls</h4>
            <div class="tut-card-grid">
              <div class="tut-badge-card">
                <span class="tut-badge-icon">👆</span>
                <div>
                  <strong>Tap Cell: Beat On / Off</strong>
                  <p>Tap any cell on the grid to toggle it as a <strong>cyan beat node</strong>. When a playhead reaches it, its instrument fires with a glowing ripple!</p>
                </div>
              </div>
              <div class="tut-badge-card">
                <span class="tut-badge-icon">🧱</span>
                <div>
                  <strong>[Wall] Button: Physical Barrier</strong>
                  <p>Tap a cell and click <strong>[🧱 Wall]</strong> in the bottom bar to convert it into an impassable crimson obstacle.</p>
                </div>
              </div>
            </div>
            <div class="tut-callout">
              <strong>Sculpt the Flow:</strong>
              <p>Playheads physically reflect off dead walls! Use walls as rhythm mirrors to trap playheads into repeatable loops and polyrhythms.</p>
            </div>
          </div>
        `;
        break;

      case 3:
        // Slide 4: Directional Routing
        bodyEl.innerHTML = isFr ? `
          <div class="tut-slide">
            <h4 class="tut-title">Routage Directionnel (Chevrons)</h4>
            <p class="tut-p">
              Par défaut, une case non routée diffuse les têtes selon les angles libres. Vous pouvez imposer une direction stricte :
            </p>
            <div class="tut-card-grid">
              <div class="tut-badge-card">
                <span class="tut-badge-icon">↗</span>
                <div>
                  <strong>Bouton [↗ Routage]</strong>
                  <p>Sélectionnez une case et cliquez sur <strong>[↗ Routage]</strong> pour choisir l'une des 6 directions de la boussole (Haut-Gauche, Droite, etc.).</p>
                </div>
              </div>
              <div class="tut-badge-card">
                <span class="tut-badge-icon">🚀</span>
                <div>
                  <strong>Chevrons Furtifs & Portes Néon</strong>
                  <p>Un grand chevron et une porte de sortie néon apparaissent sur la case pour indiquer la trajectoire exacte.</p>
                </div>
              </div>
            </div>
            <div class="tut-callout tut-callout-red">
              <strong>Suppression instantanée :</strong>
              <p>Dès qu'une case routée est sélectionnée, un bouton rouge <strong>[✕ Effacer]</strong> apparaît dans la barre du bas. Une seule touche suffit pour retirer le routage !</p>
            </div>
          </div>
        ` : `
          <div class="tut-slide">
            <h4 class="tut-title">Directional Routing (Chevrons)</h4>
            <p class="tut-p">
              By default, unrouted cells deflect playheads semi-randomly. You can force playheads into deterministic orbits:
            </p>
            <div class="tut-card-grid">
              <div class="tut-badge-card">
                <span class="tut-badge-icon">↗</span>
                <div>
                  <strong>[↗ Route] Button</strong>
                  <p>Select a cell and tap <strong>[↗ Route]</strong> in the bottom bar to pick one of 6 compass directions (Top-Right, Left, etc.).</p>
                </div>
              </div>
              <div class="tut-badge-card">
                <span class="tut-badge-icon">🚀</span>
                <div>
                  <strong>Stealth Chevrons & Facet Gates</strong>
                  <p>A bold chevron and a neon perimeter gate light up on the cell edge, making the trajectory visible at a glance.</p>
                </div>
              </div>
            </div>
            <div class="tut-callout tut-callout-red">
              <strong>Instant Removal:</strong>
              <p>Whenever a routed cell is selected, a red <strong>[✕ Clear]</strong> button appears right in the bottom bar. 1 tap removes routing instantly!</p>
            </div>
          </div>
        `;
        break;

      case 4:
        // Slide 5: Saving & URL Sharing
        bodyEl.innerHTML = isFr ? `
          <div class="tut-slide">
            <h4 class="tut-title">Partage Instantané par URL</h4>
            <p class="tut-p">
              HexaBeat encode l'intégralité de vos créations directement dans l'adresse URL :
            </p>
            <div class="tut-card-grid">
              <div class="tut-badge-card">
                <span class="tut-badge-icon">🔗</span>
                <div>
                  <strong>Bouton [🔗 PARTAGER]</strong>
                  <p>Sur smartphone, ouvre la feuille de partage native (WhatsApp, SMS, Telegram). Sur ordinateur, copie le lien direct dans le presse-papiers.</p>
                </div>
              </div>
              <div class="tut-badge-card">
                <span class="tut-badge-icon">💾</span>
                <div>
                  <strong>Boutons [💾 SAUVEGARDER] & [📁 PROJETS]</strong>
                  <p>Enregistrez vos grooves dans le navigateur, ou exportez/importez des fichiers <code>.json</code> sans limite.</p>
                </div>
              </div>
            </div>
            <div class="tut-callout">
              <strong>Prêt à créer ?</strong>
              <p>Explorez les préréglages (Techno, Hip-Hop, Trap, Polyrythmie, Ambient) ou démarrez un canevas vide pour composer votre propre rythme !</p>
            </div>
          </div>
        ` : `
          <div class="tut-slide">
            <h4 class="tut-title">Instant URL Sharing & Storage</h4>
            <p class="tut-p">
              HexaBeat encodes your entire musical groove directly into the URL hash without requiring any backend server:
            </p>
            <div class="tut-card-grid">
              <div class="tut-badge-card">
                <span class="tut-badge-icon">🔗</span>
                <div>
                  <strong>[🔗 SHARE] Button</strong>
                  <p>On mobile, opens the native share sheet (WhatsApp, Messages, Telegram). On desktop, copies the link to your clipboard.</p>
                </div>
              </div>
              <div class="tut-badge-card">
                <span class="tut-badge-icon">💾</span>
                <div>
                  <strong>[💾 SAVE] & [📁 LOAD]</strong>
                  <p>Store grooves persistently in your browser, or export and import portable <code>.json</code> project files.</p>
                </div>
              </div>
            </div>
            <div class="tut-callout">
              <strong>Ready to produce?</strong>
              <p>Explore the built-in presets (Techno, Hip-Hop, Trap, Polyrhythm, Ambient) or start from a blank canvas to craft your own generative groove!</p>
            </div>
          </div>
        `;
        break;
    }
  }
}
