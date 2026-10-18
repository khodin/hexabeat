# ⬡ HexaBeat

> **Generative 6-Directional Hexagonal Rhythm Sequencer & Groovebox**  
> Inspired by Jordan Rudess & Amidio's classic *JR Hexatone Pro*.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Deploy to GitHub Pages](https://github.com/khodin/hexabeat/actions/workflows/deploy.yml/badge.svg)](https://github.com/khodin/hexabeat/actions/workflows/deploy.yml)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-00e5ff.svg)](https://khodin.github.io/hexabeat/)

---

## 🎮 [Launch Live Web App](https://khodin.github.io/hexabeat/)

Play **HexaBeat** directly in your browser on desktop or mobile. No installation or account required.

---

## ⚡ Highlights

- ⬡ **37-Cell Hexagonal Honeycomb Matrix**: Radial coordinate geometry (radius 3 axial coordinates) with bounce deflection physics and glowing neon feedback.
- 🔊 **100% Real-Time Procedural Synthesis**: Built entirely on the Web Audio API with **zero audio samples or external asset downloads**. Kick, Snare, Closed Hat, Open Hat, Clap, and Synth Bass Pluck are synthesized mathematically in real-time with zero latency.
- 🧭 **Physical 6-Facet Compass Routing**: Direct, facet-aligned routing across all 6 hexagonal neighbors:
  - `↖ TOP-L` (North-West: $240^\circ$)
  - `↗ TOP-R` (North-East: $300^\circ$)
  - `← LEFT` (West: $180^\circ$)
  - `→ RIGHT` (East: $0^\circ$)
  - `↙ BTM-L` (South-West: $120^\circ$)
  - `↘ BTM-R` (South-East: $60^\circ$)
- 🎲 **Stochastic / Random by Default**: Unrouted cells (`✦ NO ROUTE`) let playheads branch randomly between accessible neighbors, producing self-evolving generative polyrhythms.
- 🧱 **Impassable Dead Cells & Center Launch Hub**: Paint impassable `DEAD` barrier walls. Playheads start from the center launch pad `(0, 0)` and once they disperse, the center locks into an impassable dead cell to prevent accidental stalling.
- 🏃 **Multi-Playhead Engine**: Run 1, 2, or 3 playheads simultaneously with smooth 60 FPS cubic ease-out interpolation and dynamic collision deflection.
- 📱 **Mobile & Android Ready**: Full touch/drag support, mobile safe-area insets (`env(safe-area-inset-bottom)`), responsive canvas scaling, and pre-configured Capacitor Android bridge.

---

## 🎹 Sound Engine (Procedural Synthesis)

Every sound is crafted from first principles in `src/audio/Synthesizer.ts`:

| Sound | Synthesis Architecture | Character |
| :--- | :--- | :--- |
| **KICK** | Dual sine sweep (150Hz $\to$ 38Hz), high-impact pitch envelope, click transient | Deep, punchy analog 808/909 kick |
| **SNARE** | Body sine tone (190Hz $\to$ 85Hz) blended with high-pass filtered white noise burst | Crisp, snapping acoustic/electronic snare |
| **CL.HAT** | Bandpass filtered metallic white noise (7.5kHz, Q=4) with rapid 55ms decay | Tight, sizzly closed hi-hat |
| **OP.HAT** | Highpass filtered metallic noise (6.5kHz) with 380ms exponential decay | Bright, sustaining open cymbal |
| **CLAP** | Triple-burst noise generator (spaced by 12ms) through a 1.2kHz bandpass filter | Classic 808-style group handclap |
| **SYNTH** | Low-pass filtered sawtooth wave with pitch tracking based on cell coordinate | Punchy resonant bassline pluck |
| **DEAD** | Impassable wall block (no audio output) | Physical deflection barrier |

Audio scheduling uses Chris Wilson's precision lookahead scheduler with a master dynamic limiter compressor to avoid clipping.

---

## 🛠️ Architecture

```
hexabeat/
├── .github/workflows/deploy.yml  # GitHub Actions automated Pages deployment
├── android/                      # Native Android project scaffold (Capacitor)
├── public/                       # PWA manifest, SVG icons
├── src/
│   ├── audio/
│   │   ├── AudioEngine.ts        # Web Audio lookahead loop & master bus
│   │   └── Synthesizer.ts        # Pure procedural DSP synthesizers
│   ├── grid/
│   │   ├── HexMath.ts            # Axial/cube coordinates, compass mapping, bounce
│   │   └── HexTypes.ts           # Types, compass enum, color palettes
│   ├── sequencer/
│   │   ├── Presets.ts            # Techno, Polyrhythm, IDM presets
│   │   └── Sequencer.ts          # Playhead simulation & step state machine
│   ├── ui/
│   │   ├── HexCanvas.ts          # High-DPI Canvas render loop & animations
│   │   └── UIController.ts       # Transport, sliders, palette listeners
│   ├── main.ts                   # Application bootstrap
│   └── style.css                 # Cyberpunk neon theme, safe-area layout
├── test/
│   └── test-math.mjs             # Grid math, boundary bounce & dead-cell unit tests
├── capacitor.config.ts           # Mobile runtime configuration
└── vite.config.ts                # Build configuration with relative asset paths
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm (v9 or higher)

### Installation
```bash
git clone https://github.com/khodin/hexabeat.git
cd hexabeat
npm install
```

### Local Development
```bash
npm run dev
```
Open `http://localhost:3000` (or `https://` if using the included SSL plugin for mobile testing).

### Running Unit Tests
```bash
npm test
```
Verifies coordinate distance formulas, 222 boundary bounce trajectories, and 1,000 continuous simulation steps ensuring playheads never penetrate dead cells or the center hub.

### Production Build
```bash
npm run build
```
Generates optimized, zero-dependency static assets in `dist/`.

### Android Build (Capacitor)
```bash
npx cap sync
npx cap open android
```
Opens Android Studio to run or export an APK directly to your phone.

---

## 📜 License

Released under the [MIT License](LICENSE).  
Inspired by the innovative concepts of **JR Hexatone Pro** by Jordan Rudess & Amidio.
