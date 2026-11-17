import { WIDTH, HEIGHT } from './config.js';

export class Input {
  constructor(canvas) {
    this.keys = new Set();
    this.pressed = new Set();
    this.mouse = { x: WIDTH / 2, y: HEIGHT / 2, down: false, clicked: false };
    window.addEventListener('keydown', event => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) event.preventDefault();
      if (!event.repeat) this.pressed.add(event.code);
      this.keys.add(event.code);
    });
    window.addEventListener('keyup', event => this.keys.delete(event.code));
    window.addEventListener('blur', () => { this.keys.clear(); this.mouse.down = false; });
    canvas.addEventListener('pointermove', event => this.position(canvas, event));
    canvas.addEventListener('pointerdown', event => {
      this.position(canvas, event);
      this.mouse.down = true;
      this.mouse.clicked = true;
    });
    window.addEventListener('pointerup', () => { this.mouse.down = false; });
    canvas.addEventListener('contextmenu', event => event.preventDefault());
  }
  position(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    this.mouse.x = (event.clientX - rect.left) * WIDTH / rect.width;
    this.mouse.y = (event.clientY - rect.top) * HEIGHT / rect.height;
  }
  held(code) { return this.keys.has(code); }
  tapped(code) { return this.pressed.has(code); }
  endFrame() { this.pressed.clear(); this.mouse.clicked = false; }
}
