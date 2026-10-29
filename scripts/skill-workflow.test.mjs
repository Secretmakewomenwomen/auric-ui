import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

// Stub npm in a disposable checkout: these tests never publish or install globally.
function fixture() {
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'auricui-workflow-'));
  for(const dir of ['scripts','bin','node_modules','.verification','artifacts','packages/auricui-skill'])
    fs.mkdirSync(path.join(root,dir),{recursive:true});
  fs.copyFileSync(new URL('./maintain-skill.sh',import.meta.url),path.join(root,'scripts/maintain-skill.sh'));
  fs.writeFileSync(path.join(root,'packages/auricui-skill/package.json'),JSON.stringify({name:'auricui-skill',version:'1.0.0'}));
  fs.writeFileSync(path.join(root,'.verification/skill-pack-manifest.json'),JSON.stringify({filename:'auricui-skill-1.0.0.tgz'}));
  fs.writeFileSync(path.join(root,'artifacts/auricui-skill-1.0.0.tgz'),'not installed by these tests');
  fs.writeFileSync(path.join(root,'bin/npm'),`#!/usr/bin/env bash
printf '%s\\n' "$*" >> "$WORKFLOW_TEST_LOG"
if [ "$*" = "run check" ] && [ "$WORKFLOW_FAIL_CHECK" = 1 ]; then exit 17; fi
`,{mode:0o755});
  const logfile=path.join(root,'calls.log');
  return {
    run:(args=[],env={})=>spawnSync('bash',[path.join(root,'scripts/maintain-skill.sh'),...args],{
      cwd:os.tmpdir(),encoding:'utf8',env:{...process.env,PATH:path.join(root,'bin')+path.delimiter+process.env.PATH,WORKFLOW_TEST_LOG:logfile,...env},
    }),
    calls:()=>fs.existsSync(logfile)?fs.readFileSync(logfile,'utf8').trim().split('\n'):[],
    dispose:()=>fs.rmSync(root,{recursive:true,force:true}),
  };
}

test('Skill workflow defaults to local build/check and resolves its own repository',()=>{
  const f=fixture();try {
    const result=f.run();
    assert.equal(result.status,0,result.stderr);
    assert.deepEqual(f.calls(),['run build','run check']);
    assert.match(result.stdout,/未发布 npm/);
  } finally {f.dispose();}
});

test('failed checks prevent publication and installation even when requested',()=>{
  const f=fixture();try {
    const result=f.run(['--publish','--install-global'],{WORKFLOW_FAIL_CHECK:'1'});
    assert.equal(result.status,17);
    assert.deepEqual(f.calls(),['run build','run check']);
    assert.match(result.stderr,/后续步骤已停止/);
  } finally {f.dispose();}
});

test('invalid or conflicting flags fail before running any workflow step',()=>{
  const f=fixture();try {
    for(const args of [['--unknown'],['--install-dir'],['--install-only'],['--install-global','--install-dir','x'],['--install-only','--publish','--install-global']]) {
      assert.notEqual(f.run(args).status,0,args.join(' '));
    }
    assert.deepEqual(f.calls(),[]);
  } finally {f.dispose();}
});
