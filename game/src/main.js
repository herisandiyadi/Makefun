import { WIDTH, HEIGHT, COLORS, UPGRADES } from './config.js';
import { Input } from './input.js';
import { AudioFX } from './audio.js';
import { Player } from './player.js';
import { Bullets } from './bullets.js';
import { Enemies } from './enemies.js';
import { Particles } from './particles.js';
import { hud, startScreen, shopScreen, endScreen } from './hud.js';

const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const input = new Input(canvas);
const audio = new AudioFX();
const game = { state: 'start', wave: 0, score: 0, prisms: 0, upgrades: [0, 0, 0, 0, 0],
  player: new Player(), bullets: new Bullets(), enemies: new Enemies(), particles: new Particles(),
  pickups: [], banner: 0, clearTimer: 0, endless: false, time: 0 };

function start() {
  game.wave = 0; game.score = 0; game.prisms = 0; game.endless = false;
  game.upgrades = [0, 0, 0, 0, 0];
  game.player = new Player(); game.bullets = new Bullets(); game.enemies = new Enemies();
  game.particles = new Particles(); game.pickups = [];
  nextWave();
}
function nextWave() {
  game.wave++;
  game.state = 'play'; game.banner = 2.5; game.clearTimer = 0;
  game.bullets.items.length = 0;
  game.enemies.begin(game.wave);
  game.player.shield = Math.min(100, game.player.shield + 35);
  game.player.regenDelay = 0;
}
function buy(index) {
  const upgrade = UPGRADES[index];
  const level = game.upgrades[index];
  if (!upgrade || level >= upgrade.max) return;
  const cost = upgrade.base + level * upgrade.step;
  if (game.prisms < cost) return;
  game.prisms -= cost;
  game.upgrades[index]++;
  const player = game.player;
  if (index === 0) player.fireDelay *= 0.84;
  if (index === 1) player.damage++;
  if (index === 2) { player.maxHp++; player.hp = Math.min(player.maxHp, player.hp + 1); }
  if (index === 3) player.shieldRegen += 8;
  if (index === 4) player.speed *= 1.12;
  audio.pickup();
}
function collect(pickup) {
  game.prisms += pickup.value;
  game.score += pickup.value * 10;
  game.particles.burst(pickup.x, pickup.y, COLORS.gold, 7, 90);
  audio.pickup();
}
function update(dt) {
  game.time += dt;
  game.particles.update(dt);
  if (game.state !== 'play') return;
  game.banner = Math.max(0, game.banner - dt);
  game.player.update(dt, input, game.bullets, audio, game.particles);
  game.enemies.update(dt, game.player, enemy => game.player.hurt(enemy.type === 'boss' ? 75 : 38, audio, game.particles));
  if (game.player.hp <= 0) {
    game.state = 'gameover'; audio.over();
    game.particles.burst(game.player.x, game.player.y, COLORS.cyan, 45, 270);
    return;
  }
  game.bullets.update(dt, game.enemies, game.particles, audio, enemy => {
    game.score += enemy.score;
    game.pickups.push({ x: enemy.x, y: enemy.y, value: enemy.value, angle: 0, color: enemy.color });
  });
  for (let index = game.pickups.length - 1; index >= 0; index--) {
    const pickup = game.pickups[index];
    pickup.angle += dt * 3;
    const dx = game.player.x - pickup.x, dy = game.player.y - pickup.y;
    const distance = Math.hypot(dx, dy);
    if (distance < 105 && distance > 0) {
      const speed = 175 + (105 - distance) * 3;
      pickup.x += dx / distance * speed * dt;
      pickup.y += dy / distance * speed * dt;
    }
    if (distance < 22) { collect(pickup); game.pickups.splice(index, 1); }
  }
  if (game.enemies.remaining === 0 && game.enemies.items.length === 0) {
    game.clearTimer += dt;
    if (game.clearTimer >= 1.1) {
      for (const pickup of game.pickups) collect(pickup);
      game.pickups.length = 0;
      game.state = game.wave === 20 && !game.endless ? 'victory' : 'shop';
      audio.clear();
    }
  }
}
function background() {
  ctx.fillStyle = '#111'; ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.strokeStyle = '#1a2630'; ctx.lineWidth = 1;
  const offset = game.time * 6 % 40;
  for (let x = offset; x < WIDTH; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, HEIGHT); ctx.stroke(); }
  for (let y = offset; y < HEIGHT; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(WIDTH, y); ctx.stroke(); }
  const glow = ctx.createRadialGradient(400, 300, 0, 400, 300, 440);
  glow.addColorStop(0, '#0b34401f'); glow.addColorStop(1, '#00000077');
  ctx.fillStyle = glow; ctx.fillRect(0, 0, WIDTH, HEIGHT);
}
function draw() {
  background();
  game.enemies.draw(ctx, game.time);
  for (const pickup of game.pickups) {
    ctx.save(); ctx.translate(pickup.x, pickup.y); ctx.rotate(pickup.angle);
    ctx.shadowColor = pickup.color; ctx.shadowBlur = 16;
    ctx.fillStyle = `hsl(${(game.time * 120 + pickup.x) % 360} 95% 70%)`;
    ctx.beginPath(); ctx.moveTo(0, -9); ctx.lineTo(7, 0); ctx.lineTo(0, 9); ctx.lineTo(-7, 0); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  game.bullets.draw(ctx);
  if (game.state !== 'start') game.player.draw(ctx, game.time);
  game.particles.draw(ctx);
  if (game.state !== 'start') hud(ctx, game);
  if (game.state === 'start') startScreen(ctx, input.mouse, game.time);
  if (game.state === 'shop') {
    const selection = shopScreen(ctx, game, input.mouse);
    if (selection === 5 || input.tapped('Enter')) nextWave();
    else {
      for (let index = 0; index < 5; index++) if (selection === index || input.tapped(`Digit${index + 1}`) || input.tapped(`Numpad${index + 1}`)) buy(index);
    }
  }
  if (game.state === 'gameover' || game.state === 'victory') {
    const action = endScreen(ctx, game, input.mouse, game.state === 'victory');
    if (action.restart || input.tapped('KeyR')) start();
    else if (action.endless) { game.endless = true; game.state = 'shop'; }
  }
  if (game.state === 'start' && (input.tapped('Space') || (input.mouse.clicked && input.mouse.x >= 305 && input.mouse.x <= 495 && input.mouse.y >= 380 && input.mouse.y <= 428))) start();
}
let lastTime = 0;
function frame(timestamp) {
  const dt = Math.min((timestamp - lastTime) / 1000 || 0, 0.05);
  lastTime = timestamp;
  update(dt);
  draw();
  input.endFrame();
  requestAnimationFrame(frame);
}
window.addEventListener('keydown', () => audio.unlock(), { once: true });
canvas.addEventListener('pointerdown', () => audio.unlock(), { once: true });
requestAnimationFrame(frame);
