export const WIDTH = 800;
export const HEIGHT = 600;
export const TAU = Math.PI * 2;
export const COLORS = {
  cyan: '#51f4ff', red: '#ff5269', orange: '#ff9a48', magenta: '#f45cf1',
  gold: '#ffd46a', text: '#e8f5ff', muted: '#8595ac'
};
export const TYPES = {
  circle: { radius: 13, hp: 2, speed: 82, color: COLORS.red, value: 1, score: 100, sides: 0 },
  square: { radius: 17, hp: 6, speed: 55, color: COLORS.orange, value: 2, score: 200, sides: 4 },
  triangle: { radius: 12, hp: 2, speed: 139, color: COLORS.magenta, value: 1, score: 150, sides: 3 },
  boss: { radius: 35, hp: 52, speed: 43, color: COLORS.gold, value: 12, score: 2500, sides: 6 }
};
export const UPGRADES = [
  { name: 'Rapid Pulse', detail: 'Shoot 16% faster', base: 5, step: 4, max: 6 },
  { name: 'Power Core', detail: '+1 bullet damage', base: 6, step: 5, max: 5 },
  { name: 'Heart Chamber', detail: '+1 max HP & heal', base: 7, step: 6, max: 4 },
  { name: 'Flux Shield', detail: 'Faster shield regen', base: 5, step: 4, max: 5 },
  { name: 'Vector Drive', detail: '+12% move speed', base: 5, step: 4, max: 5 }
];
