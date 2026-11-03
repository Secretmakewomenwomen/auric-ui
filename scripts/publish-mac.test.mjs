import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { loadDocsPublishEnv } from './docs-publish-env.mjs';

// Every npm/Docker command is stubbed: no versions, registries or containers are changed.
function fixture(config) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'auricui-publish-'));
  for (const dir of ['scripts', 'bin', 'node_modules']) fs.mkdirSync(path.join(root, dir));
  for (const name of ['publish-mac.sh', 'docs-publish-env.mjs'])
    fs.copyFileSync(new URL(name, import.meta.url), path.join(root, 'scripts', name));
  if (config !== undefined) fs.writeFileSync(path.join(root, '.env.publish.local'), config);
  for (const command of ['npm', 'docker']) fs.writeFileSync(path.join(root, 'bin', command), `#!/usr/bin/env bash
printf '%s|%s|%s\\n' "${command} $*" "$DOCS_IMAGE" "$DOCS_BUILDER" >> "$PUBLISH_TEST_LOG"
if [ "$PUBLISH_TEST_FAIL" = '${command}' ]; then exit 17; fi
`, { mode: 0o755 });
  const environment = { ...process.env };
  for (const name of Object.keys(environment)) if (name.startsWith('DOCS_')) delete environment[name];
  const logfile = path.join(root, 'calls.log');
  return {
    root,
    run: (args = [], env = {}) => spawnSync('bash', [path.join(root, 'scripts/publish-mac.sh'), ...args], {
      cwd: os.tmpdir(), encoding: 'utf8', env: { ...environment, PATH: path.join(root, 'bin') + path.delimiter + process.env.PATH,
        PUBLISH_TEST_LOG: logfile, PUBLISH_TEST_FAIL: '', ...env },
    }),
    calls: () => fs.existsSync(logfile) ? fs.readFileSync(logfile, 'utf8').trim().split('\n') : [],
    dispose: () => fs.rmSync(root, { recursive: true, force: true }),
  };
}

test('missing or invalid image configuration stops before npm or Docker', () => {
  for (const config of [undefined, 'DOCS_IMAGE=\n', 'DOCS_IMAGE=registry.example.com/auricui-docs:latest\n']) {
    const f = fixture(config);
    try {
      const result = f.run(['--release', 'all']);
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /DOCS_IMAGE/);
      assert.deepEqual(f.calls(), []);
    } finally { f.dispose(); }
  }
});

test('check mode loads local configuration from the project root without publishing', () => {
  const f = fixture('DOCS_IMAGE="registry.example.com:5443/auricui-docs"\nDOCS_BUILDER=private-builder\n');
  try {
    const result = f.run(['--release', 'all', '--check']);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /未递增版本、未构建或发布/);
    assert.deepEqual(f.calls(), [
      'docker info|registry.example.com:5443/auricui-docs|private-builder',
      'docker buildx inspect private-builder|registry.example.com:5443/auricui-docs|private-builder',
    ]);
  } finally { f.dispose(); }
});

test('explicit environment overrides local configuration and reaches child commands', () => {
  const f = fixture('DOCS_IMAGE=registry.example.com/default\nDOCS_BUILDER=default-builder\n');
  try {
    const result = f.run([], { DOCS_IMAGE: 'override.example.com/docs', DOCS_BUILDER: 'override-builder' });
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(f.calls().map(line => line.split('|')[0]), [
      'docker info', 'docker buildx inspect override-builder', 'npm run build', 'npm run check:docs', 'npm run docker:publish',
    ]);
    assert.ok(f.calls().every(line => line.endsWith('|override.example.com/docs|override-builder')));
  } finally { f.dispose(); }
});

test('combined release runs only after preflight and stops on release failure', () => {
  for (const fail of ['', 'docker', 'npm']) {
    const f = fixture('DOCS_IMAGE=registry.example.com/docs\n');
    try {
      const result = f.run(['--release', 'all'], { PUBLISH_TEST_FAIL: fail });
      const commands = f.calls().map(line => line.split('|')[0]);
      if (!fail) {
        assert.equal(result.status, 0, result.stderr);
        assert.deepEqual(commands, ['docker info', 'docker buildx inspect auricui-private-registry', 'npm run release -- all',
          'npm run build', 'npm run check:docs', 'npm run docker:publish']);
      } else {
        assert.equal(result.status, 17);
        assert.deepEqual(commands, fail === 'docker' ? ['docker info'] : [
          'docker info', 'docker buildx inspect auricui-private-registry', 'npm run release -- all',
        ]);
        assert.match(result.stderr, /失败阶段/);
      }
    } finally { f.dispose(); }
  }
});

test('configuration is data: unknown variables and shell substitutions are not executed', () => {
  const f = fixture();
  try {
    const marker = path.join(f.root, 'should-not-exist');
    const literal = `$(touch ${marker})`;
    fs.writeFileSync(path.join(f.root, '.env.publish.local'), `DOCS_IMAGE=registry.example.com/docs\nDOCS_BUILDER='${literal}'\nPATH=invalid\nUNRELATED=ignored\n`);
    assert.deepEqual(loadDocsPublishEnv(f.root, {}), { DOCS_IMAGE: 'registry.example.com/docs', DOCS_BUILDER: literal });
    const result = f.run(['--check']);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(fs.existsSync(marker), false);
    assert.ok(f.calls()[1].includes(`docker buildx inspect ${literal}`));
  } finally { f.dispose(); }
});

test('multiline settings are rejected before they can become another export', () => {
  const f = fixture('DOCS_IMAGE="registry.example.com/docs\nPATH=invalid"\n');
  try {
    const result = f.run(['--release', 'all']);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /单行配置值/);
    assert.deepEqual(f.calls(), []);
  } finally { f.dispose(); }
});

test('help remains available without release configuration or preflight', () => {
  const f = fixture();
  try {
    assert.equal(f.run(['--help']).status, 0);
    assert.deepEqual(f.calls(), []);
  } finally { f.dispose(); }
});
