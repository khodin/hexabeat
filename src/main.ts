import { AudioEngine } from './audio/AudioEngine';
import { Sequencer } from './sequencer/Sequencer';
import { HexCanvas } from './ui/HexCanvas';
import { UIController } from './ui/UIController';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('hex-canvas') as HTMLCanvasElement;
  if (!canvas) {
    console.error('Canvas element #hex-canvas not found');
    return;
  }

  // 1. Initialize Audio Engine
  const audioEngine = new AudioEngine();

  // 2. Initialize Sequencer
  const sequencer = new Sequencer(audioEngine);

  // 3. Initialize High-DPI Hexagonal Canvas
  const hexCanvas = new HexCanvas(canvas, sequencer);

  // 4. Initialize UI Controller
  new UIController(audioEngine, sequencer, hexCanvas);
});
