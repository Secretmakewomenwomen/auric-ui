import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import ts from 'typescript';
const root=path.resolve(import.meta.dirname,'..');
execFileSync(process.execPath,[path.join(root,'scripts/build-sample-assets.mjs')],{cwd:root,stdio:'inherit'});
const studioCss=fs.readFileSync(path.join(root,'src/styles/auricui.css'),'utf8').replace("@import '@fontsource-variable/inter';",'').replace("@import 'tailwindcss';","@import 'tailwindcss' source(none);\n@import '@fontsource-variable/inter';\n@source '../components';\n@source '../studio';\n@source '../chat';\n@source './provider.tsx';");
fs.writeFileSync(path.join(root,'src/library/styles.css'),studioCss+'\n'+fs.readFileSync(path.join(root,'src/styles/chat.css'),'utf8')+'\n'+fs.readFileSync(path.join(root,'src/styles/agent.css'),'utf8')+'\n'+fs.readFileSync(path.join(root,'src/styles/primitives.css'),'utf8'));
execFileSync(process.execPath,[path.join(root,'node_modules/vite/bin/vite.js'),'build','--config','vite.library.config.ts'],{cwd:root,stdio:'inherit'});
execFileSync(process.execPath,[path.join(root,'node_modules/typescript/bin/tsc'),'-p','tsconfig.library.json'],{cwd:root,stdio:'inherit'});
const out=path.join(root,'packages/auricui/dist/types');
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(f=>f.isDirectory()?walk(path.join(dir,f.name)):[path.join(dir,f.name)]);
// tsc doesn't copy existing declarations (the film parser is JS with a hand-written contract).
for(const file of walk(path.join(root,'src')).filter(f=>/\.d\.(ts|mts)$/.test(f))){const dest=path.join(out,path.relative(path.join(root,'src'),file));fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(file,dest);}
for(const file of walk(out).filter(f=>/\.d\.(ts|mts)$/.test(f))){
 let code=fs.readFileSync(file,'utf8');
 const ast=ts.createSourceFile(file,code,ts.ScriptTarget.Latest,true);const edits=[];
 const visit=node=>{
  if(ts.isStringLiteral(node)){
   const parent=node.parent;
   const moduleName=(ts.isImportDeclaration(parent)||ts.isExportDeclaration(parent))&&parent.moduleSpecifier===node || ts.isLiteralTypeNode(parent)&&ts.isImportTypeNode(parent.parent) || ts.isExternalModuleReference(parent);
   if(moduleName){
    let name=node.text;
    if(name.endsWith('.css')&&ts.isImportDeclaration(parent)){edits.push({start:parent.getStart(ast),end:parent.end,text:''});return;}
    for(const [alias,folder] of Object.entries({'@studio/':'studio','@chat/':'chat','@engine/':'engine','@/':''})){
     if(name.startsWith(alias)){const rel=path.relative(path.dirname(file),path.join(out,folder,name.slice(alias.length))).replaceAll(path.sep,'/');name=rel.startsWith('.')?rel:'./'+rel;break;}
    }
    if(name.startsWith('.')){name=name.replace(/\.d\.mts$/,'.mjs').replace(/\.d\.ts$/,'.js').replace(/\.(ts|tsx)$/,'');if(!/\.(mjs|cjs|js|json)$/.test(name))name+=fs.existsSync(path.resolve(path.dirname(file),name,'index.d.ts'))?'/index.js':'.js';}
    if(name!==node.text)edits.push({start:node.getStart(ast),end:node.end,text:JSON.stringify(name)});
   }
  }
  ts.forEachChild(node,visit);
 };
 visit(ast);
 for(const edit of edits.sort((a,b)=>b.start-a.start))code=code.slice(0,edit.start)+edit.text+code.slice(edit.end);
 fs.writeFileSync(file,code);
}
console.log('ESM + CSS + portable declarations built.');
