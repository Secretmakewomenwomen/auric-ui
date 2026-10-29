import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
const root = path.resolve(import.meta.dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root,'.verification/skill-pack-manifest.json'),'utf8'));
const temp = fs.mkdtempSync(path.join(os.tmpdir(),'auricui-skill-check-'));
try {
  execFileSync('tar',['-xzf',path.join(root,'artifacts',manifest.filename),'-C',temp]);
  const cli = path.join(temp,'package/bin/install.mjs');
  const run = (...args) => spawnSync(process.execPath,[cli,...args],{cwd:temp,encoding:'utf8'});
  assert.equal(run('--help').status,0);
  assert.equal(run('--global','--dry-run').status,0);
  assert.equal(run('--dir').status,1);
  assert.equal(run('--global','--dir','skills').status,1);
  assert.equal(run('--unknown').status,1);
  assert.equal(run('--dry-run').status,0);
  const target = path.join(temp,'.agents/skills/auricui');
  assert.ok(!fs.existsSync(target));
  assert.equal(run().status,0);
  assert.ok(fs.readFileSync(path.join(target,'SKILL.md'),'utf8').includes('name: auricui'));
  fs.writeFileSync(path.join(target,'user-note.txt'),'keep this customization');
  assert.equal(run('--dry-run').status,0);
  assert.equal(fs.readFileSync(path.join(target,'user-note.txt'),'utf8'),'keep this customization');
  assert.equal(run().status,1);
  assert.equal(fs.readFileSync(path.join(target,'user-note.txt'),'utf8'),'keep this customization');
  const update = run('--update');
  assert.equal(update.status,0,update.stderr);
  const backup = update.stdout.match(/Previous skill backed up: (.+)/)?.[1];
  assert.ok(backup);
  assert.equal(fs.readFileSync(path.join(backup,'user-note.txt'),'utf8'),'keep this customization');
  assert.ok(!fs.existsSync(path.join(target,'user-note.txt')));
  const api = execFileSync('python3',[path.join(target,'scripts/inspect_api.py'),'--entry','agent','--symbol','MemoryCard'],{encoding:'utf8'});
  assert.ok(api.includes('MemoryCardProps'));
  const drawerApi = execFileSync('python3',[path.join(target,'scripts/inspect_api.py'),'--entry','core','--symbol','Drawer'],{encoding:'utf8'});
  assert.ok(drawerApi.includes('DrawerProps'));
  const custom = path.join(temp,'custom skills');
  assert.equal(run('--dir',custom).status,0);
  fs.mkdirSync(path.join(temp,'links'));
  fs.symlinkSync(target,path.join(temp,'links/auricui'),'dir');
  assert.equal(run('--dir',path.join(temp,'links'),'--update').status,1);
  // Exercise npm's package->bin resolution using the exact packed tarball, without registry access.
  const npxTarget = path.join(temp,'npx-install');
  execFileSync('npm',['exec','--offline','--yes','--cache',path.join(root,'.verification/npm-skill-cache'),
    '--package='+path.join(root,'artifacts',manifest.filename),'--','auricui-skill','--dir',npxTarget],{cwd:temp,stdio:'pipe'});
  assert.ok(fs.existsSync(path.join(npxTarget,'auricui/scripts/inspect_api.py')));
  console.log('Packed installer passed: help, validation, dry run, project/custom install, overwrite protection, update backup, symlink protection and offline npm exec.');
} finally { fs.rmSync(temp,{recursive:true,force:true}); }
