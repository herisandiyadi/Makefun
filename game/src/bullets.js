import { WIDTH, HEIGHT, COLORS } from './config.js';

export class Bullets {
  constructor() { this.items = []; }
  fire(x, y, angle, damage) {
    this.items.push({ x, y, previousX: x, previousY: y, vx: Math.cos(angle) * 590, vy: Math.sin(angle) * 590, damage, life: 1.3 });
  }
  update(dt, enemies, particles, audio, onKill) {
    for (let index = this.items.length - 1; index >= 0; index--) {
      const bullet = this.items[index];
      bullet.previousX = bullet.x; bullet.previousY = bullet.y;
      bullet.x += bullet.vx * dt; bullet.y += bullet.vy * dt; bullet.life -= dt;
      let remove = bullet.life <= 0 || bullet.x < 0 || bullet.x > WIDTH || bullet.y < 0 || bullet.y > HEIGHT;
      if (!remove) for (let enemyIndex = enemies.items.length - 1; enemyIndex >= 0; enemyIndex--) {
        const enemy = enemies.items[enemyIndex];
        const segmentX = bullet.x - bullet.previousX;
        const segmentY = bullet.y - bullet.previousY;
        const progress = Math.max(0, Math.min(1, ((enemy.x - bullet.previousX) * segmentX + (enemy.y - bullet.previousY) * segmentY) / (segmentX * segmentX + segmentY * segmentY || 1)));
        if (Math.hypot(bullet.previousX + segmentX * progress - enemy.x, bullet.previousY + segmentY * progress - enemy.y) >= enemy.radius + 4) continue;
        enemy.hp -= bullet.damage; enemy.flash = 0.1;
        particles.burst(bullet.x, bullet.y, enemy.color, 5, 90);
        audio.hit();
        if (enemy.hp <= 0) {
          particles.burst(enemy.x, enemy.y, enemy.color, enemy.type === 'boss' ? 38 : 16, 200);
          enemies.items.splice(enemyIndex, 1);
          onKill(enemy);
          audio.death();
        }
        remove = true;
        break;
      }
      if (remove) this.items.splice(index, 1);
    }
  }
  draw(ctx) {
    ctx.save(); ctx.lineCap = 'round';
    for (const bullet of this.items) {
      ctx.strokeStyle = '#51f4ff77'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(bullet.previousX, bullet.previousY); ctx.lineTo(bullet.x, bullet.y); ctx.stroke();
      ctx.shadowColor = COLORS.cyan; ctx.shadowBlur = 15; ctx.fillStyle = '#d4ffff';
      ctx.beginPath(); ctx.arc(bullet.x, bullet.y, 3.5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
}
