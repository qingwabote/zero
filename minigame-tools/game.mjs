import { mkdirSync, readFileSync, writeFileSync } from 'fs';

const res = JSON.parse(readFileSync('./game.json', 'utf-8'));
for (const subpackage of res.subpackages) {
    mkdirSync(subpackage.root, { recursive: true });
    writeFileSync(`${subpackage.root}/game.js`, '');
}