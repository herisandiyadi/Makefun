// Prism Hunter — best-game-01 entry build script.
// Copies game/ and screenshots/ to the output dir and emits dossier.json for the judge.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const GAME = {
  title: 'Prism Hunter',
  tagline: 'Neon Wave Survival',
  version: '1.0.0',
  genre: 'twin-stick arcade survival',
  canvasWidth: 800,
  canvasHeight: 600,
  waves: 20,
  entryPoint: 'game/index.html',
} as const;

function validateAssets(root: string): void {
  const required = [
    join(root, 'game', 'index.html'),
    join(root, 'game', 'src', 'main.js'),
    join(root, 'screenshots'),
  ];
  for (const path of required) {
    if (!existsSync(path)) throw new Error('Missing required asset: ' + path);
  }
}

function logBuild(): void {
  console.log('[' + GAME.title + ' v' + GAME.version + '] ' + GAME.tagline + ' — ' + GAME.genre);
  console.log('  canvas: ' + GAME.canvasWidth + 'x' + GAME.canvasHeight + '  waves: ' + GAME.waves);
}

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

validateAssets(here);
logBuild();

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);

console.log('Build complete: ' + out);
