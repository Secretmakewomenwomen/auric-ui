import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const hasChinese = text => /[\p{Script=Han}]/u.test(text);
export const templateKey = node => node.head.text + node.templateSpans.map((span, i) => '${' + i + '}' + span.literal.text).join('');

/** Compile translated demo source so the live example and copyable code stay identical. */
export function localizeExample(raw, filename, dictionary) {
  const source = ts.createSourceFile(filename, raw, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const edits = [];
  const translate = text => {
    if (!hasChinese(text)) return text;
    if (!(text in dictionary)) throw new Error(`${filename}: missing demo translation: ${text}`);
    return dictionary[text];
  };
  const visit = node => {
    if (ts.isTemplateExpression(node)) {
      const key = templateKey(node);
      if (hasChinese(key)) {
        const expressions = node.templateSpans.map(span => localizeExample(span.expression.getText(source), filename, dictionary));
        const translated = translate(key).split(/(\$\{\d+\})/g).map(part => /^\$\{\d+\}$/.test(part)
          ? '${' + expressions[Number(part.slice(2, -1))] + '}'
          : part.replaceAll('\\', '\\\\').replaceAll('`', '\\`'));
        edits.push([node.getStart(source), node.end, '`' + translated.join('') + '`']);
        return;
      }
    }
    if ((ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) && hasChinese(node.text)) {
      const value = translate(node.text);
      edits.push([node.getStart(source), node.end, ts.isJsxAttribute(node.parent) ? '{' + JSON.stringify(value) + '}' : JSON.stringify(value)]);
      return;
    }
    if (ts.isJsxText(node) && hasChinese(node.text)) {
      const value = translate(node.text.replace(/\s+/g, ' ').trim());
      edits.push([node.pos, node.end, '{' + JSON.stringify(value) + '}']);
      return;
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return edits.sort((a, b) => b[0] - a[0]).reduce((text, [start, end, next]) => text.slice(0, start) + next + text.slice(end), raw);
}

export function generateEnglishExamples(root) {
  const dictionary = JSON.parse(fs.readFileSync(path.join(root, 'src/docs/locale/examples.en.json'), 'utf8'));
  const directory = path.join(root, 'src/docs/generated-examples-en');
  fs.mkdirSync(directory, { recursive: true });
  const files = fs.readdirSync(path.join(root, 'src/docs/examples')).filter(name => name.endsWith('.tsx'));
  for (const filename of files) {
    const raw = fs.readFileSync(path.join(root, 'src/docs/examples', filename), 'utf8');
    fs.writeFileSync(path.join(directory, filename), localizeExample(raw, filename, dictionary));
  }
  fs.writeFileSync(path.join(directory, 'index.ts'), files.map(file => `export * from './${file.slice(0, -4)}';`).join('\n') + '\n');
}
