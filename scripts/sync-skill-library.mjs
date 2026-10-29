import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import ts from 'typescript';
const root=path.resolve(import.meta.dirname,'..');
const skill=path.join(root,'skills/auricui');
const pkg=JSON.parse(fs.readFileSync(path.join(root,'packages/auricui/package.json'),'utf8'));
const filename=`auricui-${pkg.version}.tgz`;
const source=path.join(root,'artifacts',filename);
const destination=path.join(skill,'assets/library',filename);
fs.mkdirSync(path.dirname(destination),{recursive:true});
fs.copyFileSync(source,destination);
fs.writeFileSync(path.join(skill,'references/library-manifest.json'),JSON.stringify({file:`assets/library/${filename}`,name:pkg.name,version:pkg.version,sha256:crypto.createHash('sha256').update(fs.readFileSync(source)).digest('hex'),format:'esm',publication:{submitted:false,install_verified:true,verification:'local tarball, NodeNext types, ESM/SSR and browser build'}},null,2)+'\n');
const config=ts.readConfigFile(path.join(root,'tsconfig.json'),ts.sys.readFile);
const parsed=ts.parseJsonConfigFileContent(config.config,ts.sys,root);
const program=ts.createProgram(parsed.fileNames,parsed.options);
const checker=program.getTypeChecker();const entries={};
for(const [entry,file] of Object.entries({core:'index',chat:'chat',studio:'studio',agent:'agent'})) {
 const source=program.getSourceFile(path.join(root,`src/library/${file}.ts`));
 entries[entry]=checker.getExportsOfModule(checker.getSymbolAtLocation(source)).map(exported=>{
  const symbol=exported.flags&ts.SymbolFlags.Alias?checker.getAliasedSymbol(exported):exported;
  const declaration=symbol.valueDeclaration??symbol.declarations?.[0];
  const relative=path.relative(path.join(root,'src'),declaration.getSourceFile().fileName).replaceAll(path.sep,'/');
  return {name:exported.name,kind:symbol.flags&ts.SymbolFlags.Value?'runtime':'type',declaration:'dist/types/'+relative.replace(/\.tsx?$/,'.d.ts').replace(/\.mjs$/,'.d.mts').replace(/\.d\.d\./,'.d.')};
 }).sort((a,b)=>a.name.localeCompare(b.name));
}
fs.writeFileSync(path.join(skill,'references/api-index.json'),JSON.stringify({version:pkg.version,entries},null,2)+'\n');
const examples=JSON.parse(fs.readFileSync(path.join(root,'src/docs/generated.json'),'utf8')).examples;
for(const name of ['Theme','Drawer','Checkbox','Tree','Combobox','MessageList','ToolCall','ApprovalCard','MemoryCard','BriefingCard'])fs.writeFileSync(path.join(skill,`assets/examples/${name}.tsx`),examples[name]+'\n');
console.log(`Skill baseline synchronized to ${pkg.version}; entries: ${Object.entries(entries).map(([key,items])=>`${key} ${items.length}`).join(', ')}.`);
