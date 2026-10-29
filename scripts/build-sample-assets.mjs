import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const files={};
function walk(dir){for(const f of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,f.name);if(f.isDirectory())walk(p);else files[path.relative(path.join(root,'public/demo-film'),p).replaceAll(path.sep,'/')]=fs.readFileSync(p).toString('base64');}}
walk(path.join(root,'public/demo-film'));
fs.writeFileSync(path.join(root,'src/studio/lib/sample-assets.json'),JSON.stringify(files));
