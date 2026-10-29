import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import ts from 'typescript';
import { build } from 'esbuild';
import { pathToFileURL } from 'node:url';
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
const entryNames={core:'auricui',chat:'auricui/chat',studio:'auricui/studio',agent:'auricui/agent',demo:'auricui/demo'};
const catalogModule=path.join(root,'.verification/skill-catalog.mjs');
await build({stdin:{contents:"export {entries} from './src/registry'; export {getDoc} from './src/docs/catalog';",resolveDir:root,loader:'tsx'},bundle:true,platform:'node',format:'esm',packages:'external',outfile:catalogModule,logLevel:'silent'});
const {entries:pages,getDoc}=await import(pathToFileURL(catalogModule));
const descriptions=new Map();
for(const page of pages){const doc=getDoc(page);if(!doc.recipe)descriptions.set(`${doc.entry}:${doc.symbol}`,{description:page.description,keywords:[page.name,page.english]});}
const examples=JSON.parse(fs.readFileSync(path.join(root,'src/docs/generated.json'),'utf8')).examples;
examples.StudioDemo=fs.readFileSync(path.join(skill,'assets/examples/StudioDemo.tsx'),'utf8');
const exampleImports=new Map();
for(const [name,code] of Object.entries(examples)){
 const ast=ts.createSourceFile(name+'.tsx',code,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 const imports=[];
 for(const statement of ast.statements.filter(ts.isImportDeclaration)){
  const bindings=statement.importClause?.namedBindings;
  if(bindings&&ts.isNamedImports(bindings))for(const item of bindings.elements)imports.push(`${statement.moduleSpecifier.text}:${(item.propertyName??item.name).text}`);
 }
 exampleImports.set(name,imports);
}
for(const [entry,file] of Object.entries({core:'index',chat:'chat',studio:'studio',agent:'agent',demo:'samples'})) {
 const source=program.getSourceFile(path.join(root,`src/library/${file}.ts`));
 entries[entry]=checker.getExportsOfModule(checker.getSymbolAtLocation(source)).map(exported=>{
  const symbol=exported.flags&ts.SymbolFlags.Alias?checker.getAliasedSymbol(exported):exported;
  const declaration=symbol.valueDeclaration??symbol.declarations?.[0];
  const relative=path.relative(path.join(root,'src'),declaration.getSourceFile().fileName).replaceAll(path.sep,'/');
  const key=`${entryNames[entry]}:${exported.name}`;
  const matching=Object.keys(examples).filter(name=>exampleImports.get(name).includes(key));
  matching.sort((a,b)=>Number(b===exported.name)-Number(a===exported.name)||a.localeCompare(b));
  const focused=matching.filter(name=>name===exported.name||name===exported.name+'States');
  return {name:exported.name,kind:symbol.flags&ts.SymbolFlags.Value?'runtime':'type',declaration:'dist/types/'+relative.replace(/\.tsx?$/,'.d.ts').replace(/\.mjs$/,'.d.mts').replace(/\.d\.d\./,'.d.'),...descriptions.get(key),examples:focused.length?focused:matching.slice(0,3)};
 }).sort((a,b)=>a.name.localeCompare(b.name));
}
fs.writeFileSync(path.join(skill,'references/api-index.json'),JSON.stringify({version:pkg.version,entries},null,2)+'\n');
const exampleDir=path.join(skill,'assets/examples/components');
fs.rmSync(exampleDir,{recursive:true,force:true});fs.mkdirSync(exampleDir,{recursive:true});
for(const [name,code] of Object.entries(examples))fs.writeFileSync(path.join(exampleDir,`${name}.tsx`),code+'\n');
for(const name of ['Theme','Drawer','Checkbox','Tree','Combobox','MessageList','ToolCall','ApprovalCard','MemoryCard','BriefingCard'])fs.writeFileSync(path.join(skill,`assets/examples/${name}.tsx`),examples[name]+'\n');
console.log(`Skill baseline synchronized to ${pkg.version}; entries: ${Object.entries(entries).map(([key,items])=>`${key} ${items.length}`).join(', ')}.`);
