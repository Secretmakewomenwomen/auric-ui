import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..');
const consumer=path.join(root,'.verification/docs-consumer');
const library=path.join(consumer,'node_modules/auricui');
fs.mkdirSync(library,{recursive:true});
const manifest=JSON.parse(fs.readFileSync(path.join(root,'.verification/pack-manifest.json'),'utf8'));
fs.rmSync(library,{recursive:true,force:true});fs.mkdirSync(library,{recursive:true});
execFileSync('tar',['-xzf',path.join(root,'artifacts',manifest.filename),'--strip-components=1','-C',library]);
fs.writeFileSync(path.join(consumer,'package.json'),JSON.stringify({name:'auricui-docs-consumer',private:true,type:'module'}));
const examples=JSON.parse(fs.readFileSync(path.join(root,'src/docs/generated.json'),'utf8')).examples;
const directory=path.join(consumer,'examples');fs.rmSync(directory,{recursive:true,force:true});fs.mkdirSync(directory,{recursive:true});
for(const [name,code] of Object.entries(examples))fs.writeFileSync(path.join(directory,`${name}.tsx`),code+'\n');
const skillExamples=path.join(root,'skills/auricui/assets/examples');
let skillCount=0;
for(const file of fs.readdirSync(skillExamples)) {
 if(file.endsWith('.tsx')){fs.copyFileSync(path.join(skillExamples,file),path.join(directory,`Skill_${file}`));skillCount++;}
 else if(file.endsWith('.css'))fs.copyFileSync(path.join(skillExamples,file),path.join(directory,file));
}
fs.writeFileSync(path.join(consumer,'tsconfig.json'),JSON.stringify({compilerOptions:{target:'ES2022',module:'NodeNext',moduleResolution:'NodeNext',jsx:'react-jsx',strict:true,noEmit:true,skipLibCheck:false,lib:['ES2022','DOM','DOM.Iterable']},include:['examples/*.tsx']}));
execFileSync(process.execPath,[path.join(root,'node_modules/typescript/bin/tsc'),'-p',path.join(consumer,'tsconfig.json')],{stdio:'inherit'});
console.log(`All ${Object.keys(examples).length} documentation examples and ${skillCount} Skill examples compile against ${manifest.filename} with strict NodeNext types.`);
