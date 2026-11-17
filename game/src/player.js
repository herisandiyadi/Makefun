import { WIDTH, HEIGHT, COLORS } from './config.js';

export class Player {
  constructor() {
    this.x = WIDTH / 2; this.y = HEIGHT / 2;
    this.radius = 13; this.hp = 3; this.maxHp = 3;
    this.shield = 100; this.maxShield = 100;
    this.shieldRegen = 12; this.speed = 225;
    this.damage = 1; this.fireDelay = 0.19;
    this.cooldown = 0; this.invincible = 0; this.regenDelay = 0;
    this.angle = -Math.PI / 2;
  }
  update(dt, input, bullets, audio, particles) {
    const horizontal = Number(input.held('KeyD') || input.held('ArrowRight')) - Number(input.held('KeyA') || input.held('ArrowLeft'));
    const vertical = Number(input.held('KeyS') || input.held('ArrowDown')) - Number(input.held('KeyW') || input.held('ArrowUp'));
    const length = Math.hypot(horizontal, vertical) || 1;
    this.x = Math.max(20, Math.min(WIDTH - 20, this.x + horizontal / length * this.speed * dt));
    this.y = Math.max(65, Math.min(HEIGHT - 20, this.y + vertical / length * this.speed * dt));
    this.angle = Math.atan2(input.mouse.y - this.y, input.mouse.x - this.x);
    this.cooldown -= dt; this.invincible = Math.max(0, this.invincible - dt);
    this.regenDelay = Math.max(0, this.regenDelay - dt);
    if (!this.regenDelay) this.shield = Math.min(this.maxShield, this.shield + this.shieldRegen * dt);
    if ((input.mouse.down || input.held('Space')) && this.cooldown <= 0) {
      bullets.fire(this.x + Math.cos(this.angle) * 19, this.y + Math.sin(this.angle) * 19, this.angle, this.damage);
      particles.burst(this.x + Math.cos(this.angle) * 19, this.y + Math.sin(this.angle) * 19, COLORS.cyan, 2, 35);
      this.cooldown = this.fireDelay;
      audio.shoot();
    }
  }
  hurt(amount, audio, particles) {
    if (this.invincible > 0) return false;
    this.invincible = 0.85;
    this.regenDelay = 3;
    const absorbed = Math.min(this.shield, amount);
    this.shield -= absorbed;
    if (amount > absorbed) this.hp--;
    particles.burst(this.x, this.y, COLORS.cyan, 16, 185);
    audio.hurt();
    return true;
  }
  draw(ctx, time) {
    if (this.invincible && Math.sin(time * 27) < -0.2) return;
    ctx.save();
    ctx.translate(this.x, this.y); ctx.rotate(this.angle);
    ctx.shadowColor = COLORS.cyan; ctx.shadowBlur = 22;
    ctx.fillStyle = '#a9faff'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(19, 0); ctx.lineTo(-13, -11); ctx.lineTo(-8, 0); ctx.lineTo(-13, 11); ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#2c84a8'; ctx.beginPath(); ctx.arc(-2, 0, 4, 0, Math.PI * 2); ctx.fill();
    if (this.shield > 0) {
      ctx.shadowBlur = 0; ctx.strokeStyle = `rgba(81,244,255,${0.13 + this.shield / 600})`;
      ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
  }
}
