import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
if (args.includes('--help')) {
  console.log('Usage: npm run release -- [lib|skill|all] [--dry-run]\nDefault: lib. Preview versions increment prerelease; stable versions increment patch.\n--dry-run builds and checks packages without publishing or retaining version changes.');
  process.exit(0);
}
const target = args.find(arg => !arg.startsWith('--')) ?? 'lib';
if (!['lib', 'skill', 'all'].includes(target) || args.some(arg => ![target, '--dry-run'].includes(arg))) {
  throw new Error('Invalid arguments. Use --help for usage.');
}
const dryRun = args.includes('--dry-run');
const run = (command, argv, cwd = root) => execFileSync(command, argv, { cwd, stdio: 'inherit' });
const script = name => run(process.execPath, [path.join(root, 'scripts', name)]);
const selected = target === 'all' ? ['lib', 'skill'] : [target];
const originals = new Map();
const published = new Set();
const artifacts = [];
try {
  if (!dryRun) {
    console.log('Checking npm authentication (publishing permissions are checked by npm publish)...');
    run('npm', ['whoami', '--cache', path.join(root, '.verification/npm-cache'), '--fetch-retries=0', '--fetch-timeout=15000']);
  }
  for (const item of selected) {
    const dir = path.join(root, 'packages', item === 'lib' ? 'auricui' : 'auricui-skill');
    const file = path.join(dir, 'package.json');
    const original = fs.readFileSync(file, 'utf8');
    originals.set(file, original);
    const pkg = JSON.parse(original);
    run('npm', ['version', pkg.version.includes('-') ? 'prerelease' : 'patch', '--no-git-tag-version', '--ignore-scripts', '--package-lock=false'], dir);
    if (item === 'lib') {
      script('build-library.mjs');
      script('pack-library.mjs');
      script('check-package.mjs');
    } else {
      // When releasing both, bundle the newly built library into the skill.
      if (target === 'all') script('sync-skill-library.mjs');
      script('build-skill-package.mjs');
      script('check-skill-package.mjs');
    }
    const manifestName = item === 'lib' ? 'pack-manifest.json' : 'skill-pack-manifest.json';
    const manifest = JSON.parse(fs.readFileSync(path.join(root, '.verification', manifestName), 'utf8'));
    artifacts.push({ file, tarball: path.join(root, 'artifacts', manifest.filename), tag: pkg.publishConfig?.tag ?? 'latest' });
  }
  // Validate every selected package before the first publish.
  for (const { file, tarball, tag } of artifacts) {
    run('npm', ['publish', tarball, '--access', 'public', '--tag', tag, '--cache', path.join(root, '.verification/npm-cache'), ...(dryRun ? ['--dry-run'] : [])]);
    if (!dryRun) published.add(file);
  }
  console.log(dryRun ? 'Dry run complete; package versions restored.' : 'Release complete.');
} catch (error) {
  console.error(error.message);
  console.error('Release failed. Successfully published versions are retained; unpublished versions are restored.');
  process.exitCode = 1;
} finally {
  for (const [file, original] of originals) {
    if (!published.has(file)) fs.writeFileSync(file, original);
  }
}
