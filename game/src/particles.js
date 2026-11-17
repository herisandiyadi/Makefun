import { TAU } from './config.js';

export class Particles {
  constructor() { this.items = []; }
  burst(x, y, color, count = 12, force = 140) {
    for (let index = 0; index < count; index++) {
      const angle = Math.random() * TAU;
      const speed = (0.25 + Math.random() * 0.75) * force;
      const life = 0.25 + Math.random() * 0.4;
      this.items.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life, max: life, size: 1.5 + Math.random() * 3, color });
    }
    if (this.items.length > 450) this.items.splice(0, this.items.length - 450);
  }
  update(dt) {
    for (let index = this.items.length - 1; index >= 0; index--) {
      const item = this.items[index];
      item.x += item.vx * dt; item.y += item.vy * dt;
      item.vx *= Math.exp(-2 * dt); item.vy *= Math.exp(-2 * dt);
      item.life -= dt;
      if (item.life <= 0) this.items.splice(index, 1);
    }
  }
  draw(ctx) {
    for (const item of this.items) {
      ctx.globalAlpha = item.life / item.max;
      ctx.fillStyle = item.color;
      ctx.fillRect(item.x, item.y, item.size, item.size);
    }
    ctx.globalAlpha = 1;
  }
}
