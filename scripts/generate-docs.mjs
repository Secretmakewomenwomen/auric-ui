import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { commonHelp, componentHelp, inheritedProps, defaultOverrides } from './docs-metadata.mjs';
const root=path.resolve(import.meta.dirname,'..');
const config=ts.readConfigFile(path.join(root,'tsconfig.json'),ts.sys.readFile);
const parsed=ts.parseJsonConfigFileContent(config.config,ts.sys,root);
const program=ts.createProgram(parsed.fileNames,parsed.options);
const checker=program.getTypeChecker();
const api={};
function parameterDefaults(declaration) {
  let fn=declaration;
  if(ts.isVariableDeclaration(fn)) {
    fn=fn.initializer;
    if(fn&&ts.isCallExpression(fn))fn=fn.arguments.find(arg=>ts.isFunctionExpression(arg)||ts.isArrowFunction(arg));
  }
  const name=fn?.parameters?.[0]?.name;
  if(!name||!ts.isObjectBindingPattern(name))return {};
  return Object.fromEntries(name.elements.filter(element=>element.initializer).map(element=>[
    (element.propertyName??element.name).getText(),element.initializer.getText(),
  ]));
}
function propTypeText(type,declaration) {
  const literalUnion=type.isUnion()&&type.types.every(item=>item.flags&(ts.TypeFlags.StringLiteral|ts.TypeFlags.NumberLiteral|ts.TypeFlags.BooleanLiteral|ts.TypeFlags.Undefined|ts.TypeFlags.Null));
  const flags=ts.TypeFormatFlags.NoTruncation|(literalUnion?ts.TypeFormatFlags.InTypeAlias:0);
  const text=literalUnion?[...type.types].sort((a,b)=>Number(!!(a.flags&ts.TypeFlags.Undefined))-Number(!!(b.flags&ts.TypeFlags.Undefined))).map(item=>checker.typeToString(item,declaration,flags)).join(' | '):checker.typeToString(type,declaration,flags);
  return text.replace(/import\("([^"]+)"\)/g,(_,specifier)=>{
    const normalized=specifier.replaceAll('\\','/');
    const workspace=root.replaceAll('\\','/')+'/';
    const dependency=normalized.split('/node_modules/');
    if(dependency.length>1)return `import("${dependency.at(-1).replace(/\/index$/, '')}")`;
    if(normalized.startsWith(workspace))return `import("./${normalized.slice(workspace.length)}")`;
    return `import("${specifier}")`;
  });
}
for(const [entry,file] of Object.entries({'auricui':'index','auricui/chat':'chat','auricui/studio':'studio','auricui/agent':'agent'})) {
  const source=program.getSourceFile(path.join(root,`src/library/${file}.ts`));
  for(const exported of checker.getExportsOfModule(checker.getSymbolAtLocation(source))) {
    const symbol=exported.flags&ts.SymbolFlags.Alias?checker.getAliasedSymbol(exported):exported;
    const decl=symbol.valueDeclaration??symbol.declarations?.[0];if(!decl)continue;
    const call=checker.getSignaturesOfType(checker.getTypeOfSymbolAtLocation(symbol,decl),ts.SignatureKind.Call)[0];
    if(!call||!call.parameters.length)continue;
    const parameter=call.parameters[0];
    const propsType=checker.getTypeOfSymbolAtLocation(parameter,decl);
    const defaults={...parameterDefaults(decl),...defaultOverrides[exported.name]};
    const local=prop=>prop.declarations?.some(d=>!d.getSourceFile().fileName.includes('node_modules'));
    const props=checker.getPropertiesOfType(propsType).filter(prop=>local(prop)||inheritedProps[exported.name]?.includes(prop.name)).map(prop=>({
      name:prop.name,
      type:propTypeText(checker.getTypeOfSymbolAtLocation(prop,decl),decl),
      required:!(prop.flags&ts.SymbolFlags.Optional),
      inherited:!local(prop),
      defaultValue:defaults[prop.name]??null,
      description:componentHelp[exported.name]?.[prop.name]||(!local(prop)?commonHelp[prop.name]:null)||ts.displayPartsToString(prop.getDocumentationComment(checker))||commonHelp[prop.name]||'',
    })).sort((a,b)=>Number(a.inherited)-Number(b.inherited)||(a.inherited?(inheritedProps[exported.name]?.indexOf(a.name)??0)-(inheritedProps[exported.name]?.indexOf(b.name)??0):0));
    api[`${entry}:${exported.name}`]={props,source:path.relative(root,decl.getSourceFile().fileName),description:ts.displayPartsToString(symbol.getDocumentationComment(checker))};
  }
}
const examples={};
for(const filename of fs.readdirSync(path.join(root,'src/docs/examples')).filter(n=>n.endsWith('.tsx'))) {
  const file=path.join(root,'src/docs/examples',filename);const raw=fs.readFileSync(file,'utf8');
  const ast=ts.createSourceFile(file,raw,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  for(const node of ast.statements.filter(ts.isFunctionDeclaration)) {
    if(!node.name?.text.endsWith('Example'))continue;
    const identifiers=new Set();const visit=n=>{if(ts.isIdentifier(n))identifiers.add(n.text);ts.forEachChild(n,visit);};visit(node);
    const imports=[];
    for(const declaration of ast.statements.filter(ts.isImportDeclaration)) {
      const bindings=declaration.importClause?.namedBindings;
      const defaultName=declaration.importClause?.name;
      if(bindings&&ts.isNamedImports(bindings)) {
        const used=bindings.elements.filter(element=>identifiers.has(element.name.text));
        if(used.length) imports.push(`import { ${used.map(element=>element.getText(ast)).join(', ')} } from '${declaration.moduleSpecifier.text.replace('../../library/agent','auricui/agent').replace('../../library/chat','auricui/chat').replace('../../library/studio','auricui/studio').replace('../../library/index','auricui')}';`);
      } else if(defaultName&&identifiers.has(defaultName.text)) imports.push(declaration.getText(ast));
    }
    const name=node.name.text.replace(/Example$/,'');
    examples[name]=[...imports,"import 'auricui/styles.css';",'',node.getText(ast).replace(`export function ${node.name.text}`, 'export default function Example')].join('\n');
  }
}
fs.writeFileSync(path.join(root,'src/docs/generated.json'),JSON.stringify({api,examples},null,2)+'\n');
console.log(`Generated ${Object.keys(api).length} public API records and ${Object.keys(examples).length} executable examples.`);
