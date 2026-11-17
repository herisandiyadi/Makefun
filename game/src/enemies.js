import { WIDTH, HEIGHT, TAU, TYPES } from './config.js';

export class Enemies {
  constructor() {
    this.items = [];
    this.remaining = 0;
    this.timer = 0;
    this.wave = 0;
    this.spawned = 0;
    this.seed = 24731;
  }
  random() {
    this.seed = (Math.imul(this.seed, 1664525) + 1013904223) >>> 0;
    return this.seed / 4294967296;
  }
  begin(wave) {
    this.wave = wave;
    this.remaining = Math.min(5 + wave * 2, 45) + (wave % 5 === 0 ? 1 : 0);
    this.spawned = 0;
    this.timer = 0.65;
    this.items.length = 0;
  }
  spawn(player) {
    const boss = this.wave % 5 === 0 && this.spawned === 0;
    const roll = this.random();
    const type = boss ? 'boss' : roll < Math.max(0.22, 0.72 - this.wave * 0.025) ? 'circle' : roll < 0.83 ? 'square' : 'triangle';
    const stats = TYPES[type];
    let x, y;
    for (let attempt = 0; attempt < 12; attempt++) {
      const edge = Math.floor(this.random() * 4);
      x = edge === 0 ? -40 : edge === 1 ? WIDTH + 40 : this.random() * WIDTH;
      y = edge === 2 ? -40 : edge === 3 ? HEIGHT + 40 : this.random() * HEIGHT;
      if (Math.hypot(x - player.x, y - player.y) > 250) break;
    }
    this.items.push({ x, y, type, color: stats.color, radius: stats.radius,
      hp: stats.hp + (type === 'boss' ? Math.floor(this.wave / 5) * 12 : Math.floor((this.wave - 1) / 5)),
      speed: stats.speed * (1 + Math.min(this.wave, 25) * 0.012),
      angle: 0, flash: 0, phase: this.random() * TAU, value: stats.value, score: stats.score });
    this.remaining--;
    this.spawned++;
  }
  update(dt, player, onContact) {
    if (this.remaining > 0) {
      this.timer -= dt;
      if (this.timer <= 0) {
        this.spawn(player);
        this.timer = Math.max(0.3, 0.9 - this.wave * 0.018);
      }
    }
    for (const enemy of this.items) {
      enemy.flash = Math.max(0, enemy.flash - dt);
      const dx = player.x - enemy.x, dy = player.y - enemy.y;
      const distance = Math.hypot(dx, dy) || 1;
      enemy.angle = Math.atan2(dy, dx);
      const sway = enemy.type === 'triangle' ? Math.sin(enemy.phase += dt * 7) * 0.33 : 0;
      enemy.x += Math.cos(enemy.angle + sway) * enemy.speed * dt;
      enemy.y += Math.sin(enemy.angle + sway) * enemy.speed * dt;
      if (distance < enemy.radius + player.radius) {
        onContact(enemy);
        const overlap = enemy.radius + player.radius - distance;
        enemy.x -= dx / distance * overlap * 0.7;
        enemy.y -= dy / distance * overlap * 0.7;
      }
    }
  }
  draw(ctx, time) {
    ctx.save(); ctx.lineWidth = 2;
    for (const enemy of this.items) {
      const stats = TYPES[enemy.type];
      ctx.save(); ctx.translate(enemy.x, enemy.y);
      ctx.rotate(enemy.type === 'triangle' ? enemy.angle : time * (enemy.type === 'boss' ? 0.35 : 0.65) + enemy.phase);
      ctx.shadowColor = enemy.color; ctx.shadowBlur = enemy.type === 'boss' ? 29 : 17;
      ctx.strokeStyle = enemy.flash ? '#fff' : enemy.color;
      ctx.fillStyle = enemy.flash ? '#fff' : '#111723';
      ctx.beginPath();
      if (!stats.sides) ctx.arc(0, 0, enemy.radius, 0, TAU);
      else for (let corner = 0; corner < stats.sides; corner++) {
        const angle = corner / stats.sides * TAU + (enemy.type === 'triangle' ? 0 : Math.PI / stats.sides);
        const x = Math.cos(angle) * enemy.radius, y = Math.sin(angle) * enemy.radius;
        if (!corner) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath(); ctx.fill(); ctx.stroke();
      if (enemy.type === 'boss') {
        ctx.shadowBlur = 8; ctx.beginPath(); ctx.arc(0, 0, 18, 0, TAU); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 0, 5, 0, TAU); ctx.fillStyle = enemy.color; ctx.fill();
      }
      ctx.restore();
    }
    ctx.restore();
  }
}
