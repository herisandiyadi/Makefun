import { WIDTH, HEIGHT, COLORS, UPGRADES } from './config.js';

export function text(ctx, content, x, y, size = 16, color = COLORS.text, align = 'left', weight = 'normal') {
  ctx.font = `${weight} ${size}px Arial, Helvetica, sans-serif`;
  ctx.textAlign = align; ctx.fillStyle = color;
  ctx.fillText(content, x, y);
}

export function button(ctx, label, x, y, width, height, mouse, active = true) {
  const hover = active && mouse.x >= x && mouse.x <= x + width && mouse.y >= y && mouse.y <= y + height;
  ctx.fillStyle = hover ? '#236376' : '#193243';
  ctx.strokeStyle = active ? COLORS.cyan : COLORS.muted;
  ctx.lineWidth = 2; ctx.shadowColor = active ? COLORS.cyan : 'transparent'; ctx.shadowBlur = hover ? 17 : 0;
  ctx.fillRect(x, y, width, height); ctx.strokeRect(x, y, width, height);
  ctx.shadowBlur = 0;
  text(ctx, label, x + width / 2, y + height / 2 + 6, 17, active ? COLORS.text : COLORS.muted, 'center', 'bold');
  return hover && mouse.clicked;
}

export function hud(ctx, game) {
  ctx.fillStyle = '#090f1de8'; ctx.fillRect(0, 0, WIDTH, 55);
  ctx.strokeStyle = '#264356'; ctx.beginPath(); ctx.moveTo(0, 55); ctx.lineTo(WIDTH, 55); ctx.stroke();
  text(ctx, `WAVE ${game.wave}${game.endless ? ' ∞' : ' / 20'}`, 18, 35, 17, COLORS.cyan, 'left', 'bold');
  text(ctx, `SCORE ${game.score.toLocaleString()}`, 200, 35, 16);
  text(ctx, `◆ ${game.prisms}`, 380, 35, 18, COLORS.gold, 'left', 'bold');
  for (let index = 0; index < game.player.maxHp; index++) {
    const x = 567 + index * 19;
    text(ctx, '♥', x, 34, 19, index < game.player.hp ? COLORS.red : '#394452');
  }
  ctx.fillStyle = '#1b3240'; ctx.fillRect(678, 24, 102, 11);
  ctx.fillStyle = COLORS.cyan; ctx.fillRect(679, 25, 100 * game.player.shield / game.player.maxShield, 9);
  text(ctx, 'SHIELD', 679, 18, 10, COLORS.muted);
  if (game.banner > 0) {
    ctx.globalAlpha = Math.min(1, game.banner);
    text(ctx, game.wave % 5 === 0 ? `WAVE ${game.wave}  •  BOSS INBOUND` : `WAVE ${game.wave}`, WIDTH / 2, 110, 27, COLORS.gold, 'center', 'bold');
    ctx.globalAlpha = 1;
  }
}

export function backdrop(ctx, title, subtitle) {
  ctx.fillStyle = '#090d19e8'; ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.textAlign = 'center'; ctx.shadowColor = COLORS.cyan; ctx.shadowBlur = 24;
  text(ctx, title, WIDTH / 2, 130, 48, COLORS.cyan, 'center', 'bold');
  ctx.shadowBlur = 0;
  text(ctx, subtitle, WIDTH / 2, 170, 16, COLORS.muted, 'center');
}

export function startScreen(ctx, mouse, time) {
  backdrop(ctx, 'PRISM HUNTER', 'NEON WAVE SURVIVAL');
  ctx.save(); ctx.translate(400, 254); ctx.rotate(time * 0.6);
  ctx.strokeStyle = COLORS.cyan; ctx.lineWidth = 3; ctx.shadowColor = COLORS.cyan; ctx.shadowBlur = 24;
  ctx.beginPath(); ctx.moveTo(0, -40); ctx.lineTo(40, 0); ctx.lineTo(0, 40); ctx.lineTo(-40, 0); ctx.closePath(); ctx.stroke(); ctx.restore();
  text(ctx, 'PRESS SPACE TO START', 400, 355, 25, COLORS.text, 'center', 'bold');
  button(ctx, 'START HUNT', 305, 380, 190, 48, mouse);
  text(ctx, 'WASD / ARROWS  ·  MOVE', 400, 476, 16, COLORS.muted, 'center');
  text(ctx, 'MOUSE  ·  AIM     CLICK / SPACE  ·  FIRE', 400, 504, 16, COLORS.muted, 'center');
  text(ctx, 'Collect prisms. Upgrade between waves. Survive all 20.', 400, 550, 15, COLORS.gold, 'center');
}

export function shopScreen(ctx, game, mouse) {
  backdrop(ctx, `WAVE ${game.wave} CLEARED`, 'SPEND PRISMS  ·  PICK YOUR NEXT EVOLUTION');
  text(ctx, `◆  ${game.prisms} PRISMS`, 400, 215, 22, COLORS.gold, 'center', 'bold');
  let selection = -1;
  UPGRADES.forEach((upgrade, index) => {
    const x = 48 + index * 143;
    const level = game.upgrades[index];
    const cost = upgrade.base + level * upgrade.step;
    const available = level < upgrade.max && game.prisms >= cost;
    const hover = mouse.x >= x && mouse.x <= x + 133 && mouse.y >= 250 && mouse.y <= 400;
    ctx.fillStyle = hover && available ? '#1b3d4b' : '#141e2e';
    ctx.strokeStyle = available ? COLORS.cyan : '#41516a'; ctx.lineWidth = hover ? 2 : 1;
    ctx.fillRect(x, 250, 133, 150); ctx.strokeRect(x, 250, 133, 150);
    text(ctx, `${index + 1}`, x + 66, 282, 21, COLORS.gold, 'center', 'bold');
    text(ctx, upgrade.name, x + 66, 317, 14, COLORS.text, 'center', 'bold');
    text(ctx, upgrade.detail, x + 66, 341, 11, COLORS.muted, 'center');
    text(ctx, `LV ${level}/${upgrade.max}`, x + 66, 367, 12, COLORS.muted, 'center');
    text(ctx, level >= upgrade.max ? 'MAXED' : `◆ ${cost}`, x + 66, 389, 16, available ? COLORS.gold : COLORS.muted, 'center', 'bold');
    if (hover && mouse.clicked && available) selection = index;
  });
  if (button(ctx, 'NEXT WAVE  →', 300, 456, 200, 51, mouse)) selection = 5;
  text(ctx, 'Press 1–5 to buy  ·  ENTER to continue', 400, 548, 15, COLORS.muted, 'center');
  return selection;
}

export function endScreen(ctx, game, mouse, victory) {
  backdrop(ctx, victory ? 'PRISM MASTER' : 'SIGNAL LOST', victory ? 'YOU SURVIVED 20 WAVES' : 'THE HUNT ENDS HERE');
  text(ctx, `FINAL SCORE`, 400, 247, 16, COLORS.muted, 'center');
  text(ctx, game.score.toLocaleString(), 400, 306, 46, COLORS.gold, 'center', 'bold');
  text(ctx, `WAVE REACHED  ${game.wave}`, 400, 361, 18, COLORS.text, 'center');
  const restart = button(ctx, 'RESTART  [R]', victory ? 194 : 300, 423, 194, 52, mouse);
  const endless = victory && button(ctx, 'ENDLESS MODE  →', 412, 423, 194, 52, mouse);
  return { restart, endless };
}
