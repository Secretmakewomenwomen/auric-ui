import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const destination = path.join(root, 'public/downloads');
fs.mkdirSync(destination, { recursive: true });
for (const name of ['auricui', 'auricui-skill']) {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'packages', name, 'package.json'), 'utf8'));
  const filename = `${name}-${manifest.version}.tgz`;
  const source = path.join(root, 'artifacts', filename);
  if (!fs.existsSync(source)) throw new Error(`Missing ${filename}. Run npm run ${name === 'auricui' ? 'pack:lib' : 'pack:skill'} before building the documentation.`);
  const packed = JSON.parse(execFileSync('tar', ['-xOf', source, 'package/package.json'], { encoding: 'utf8' }));
  if (packed.name !== name || packed.version !== manifest.version) throw new Error(`Package contents do not match ${filename}`);
  fs.copyFileSync(source, path.join(destination, filename));
  console.log(`Documentation download: ${filename}`);
}
