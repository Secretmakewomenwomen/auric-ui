#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const help = `AuricUI Skill installer

Usage: npx auricui-skill [--global | --dir <skills-directory>] [--update] [--dry-run]

Default: .agents/skills/auricui in the current project
--global   Install into CODEX_HOME/skills, or ~/.codex/skills
--dir      Choose another agent's skills directory; appends /auricui
--update   Back up and replace an existing auricui skill
--dry-run  Show the destination without writing files
--help     Show this help

The installer copies the Skill only. Your agent follows it to install/use the auricui React library.
`;

function main() {
  let global = false, directory, update = false, dry = false;
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) { console.log(help); return; }
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--global') global = true;
    else if (arg === '--update') update = true;
    else if (arg === '--dry-run') dry = true;
    else if (arg === '--dir') {
      directory = args[++i];
      if (!directory || directory.startsWith('--')) throw new Error('--dir requires a skills directory');
    } else throw new Error(`Unknown argument: ${arg}`);
  }
  if (global && directory) throw new Error('Choose either --global or --dir');
  const base = path.resolve(directory ?? (global
    ? path.join(process.env.CODEX_HOME || path.join(os.homedir(), '.codex'), 'skills')
    : path.join(process.cwd(), '.agents', 'skills')));
  const target = path.join(base, 'auricui');
  const source = fileURLToPath(new URL('../skill/', import.meta.url));
  if (!fs.existsSync(path.join(source, 'SKILL.md'))) throw new Error('Skill payload missing. Build the distribution package before running it.');
  const present = fs.existsSync(target) || (() => { try { return fs.lstatSync(target).isSymbolicLink(); } catch { return false; } })();
  console.log(`Destination: ${target}`);
  if (dry) { console.log('Dry run: no files written.' + (present ? ' Destination already exists; an actual update requires --update.' : '')); return; }
  if (present && fs.lstatSync(target).isSymbolicLink()) throw new Error(`Refusing to replace a symlink: ${target}`);
  if (present && !update) throw new Error(`Skill already exists: ${target}\nUse --update to back it up and replace it.`);
  if (present && !fs.statSync(target).isDirectory()) throw new Error(`Destination is not a directory: ${target}`);
  fs.mkdirSync(base, {recursive: true});
  const staging = fs.mkdtempSync(path.join(base, '.auricui-stage-'));
  let backup;
  try {
    fs.cpSync(source, staging, {recursive: true, dereference: false});
    if (present) {
      backup = path.join(path.dirname(base), '.auricui-skill-backups', `${Date.now()}-${randomUUID()}`);
      fs.mkdirSync(path.dirname(backup), {recursive: true});
      fs.renameSync(target, backup);
    }
    try { fs.renameSync(staging, target); }
    catch (error) { if (backup) fs.renameSync(backup, target); throw error; }
  } finally { fs.rmSync(staging, {recursive: true, force: true}); }
  if (backup) console.log(`Previous skill backed up: ${backup}`);
  console.log('Installed AuricUI Skill. Refresh your agent skill list or open a new session, then invoke $auricui.');
}

try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
