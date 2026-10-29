#!/usr/bin/env python3
"""Query only the AuricUI exports, declarations or example needed for a task."""
import argparse
import json
import posixpath
import re
import tarfile
from pathlib import Path, PurePosixPath

ENTRIES = {'core': '.', 'agent': './agent', 'chat': './chat', 'studio': './studio', 'demo': './demo'}
# TypeScript's declaration emitter places top-level statements at column zero.
DECL = re.compile(r'^(?P<export>export\s+)?(?:declare\s+)?(?:abstract\s+)?(?P<kind>interface|type|class|enum|function|const|let|var)\s+(?P<name>[\w$]+)', re.M)
BOUNDARY = re.compile(r'^(?:export\b|import\b|declare\b|(?:abstract\s+)?(?:interface|type|class|enum|function|const|let|var)\s)', re.M)
COMMENTS = re.compile(r'/\*[\s\S]*?\*/|//[^\n]*')


def declarations(text):
    result = {}
    boundaries = [m.start() for m in BOUNDARY.finditer(text)] + [len(text)]
    for match in DECL.finditer(text):
        end = next(n for n in boundaries if n > match.start())
        result.setdefault(match['name'], []).append(text[match.start():end].strip())
    return result


def compact(text, symbol):
    blocks = declarations(text)
    if symbol not in blocks:
        raise ValueError(f'Cannot isolate {symbol}; use --full to inspect the actual declaration file.')
    selected, pending = {}, [symbol]
    while pending:
        name = pending.pop(0)
        if name in selected:
            continue
        selected[name] = '\n'.join(blocks[name])
        tokens = set(re.findall(r'\b[\w$]+\b', COMMENTS.sub('', selected[name])))
        pending.extend(n for n in blocks if n in tokens and n not in selected)
    imports = re.findall(r'^import\b[^;]*;', text, re.M)
    return '\n\n'.join(imports + list(selected.values()))


class Package:
    def __init__(self, skill, project, package_name):
        self.root = None
        self.archive = None
        if project:
            project = project.resolve()
            for parent in [project, *project.parents]:
                manifest = parent / 'node_modules' / package_name / 'package.json'
                if manifest.is_file():
                    self.root = manifest.resolve().parent
                    break
        if self.root:
            self.manifest = json.loads((self.root / 'package.json').read_text())
            self.origin = 'Installed'
        else:
            if project:
                print('No installed package found; using bundled baseline (not the project API).')
            baseline = json.loads((skill / 'references/library-manifest.json').read_text())
            self.archive = tarfile.open(skill / baseline['file'], 'r:gz')
            self.manifest = json.loads(self.read('package.json'))
            self.origin = 'Bundled'

    def read(self, name):
        rel = PurePosixPath(name)
        if rel.is_absolute() or '..' in rel.parts:
            raise ValueError('Expected a package-relative path')
        if self.root:
            target = (self.root / name).resolve()
            target.relative_to(self.root)
            return target.read_text()
        member = self.archive.extractfile('package/' + name)
        if member is None:
            raise ValueError('Not a regular package file: ' + name)
        return member.read().decode()

    def resolve(self, parent, specifier):
        if not specifier.startswith('.'):
            raise ValueError('External re-export requires direct inspection: ' + specifier)
        candidate = posixpath.normpath(posixpath.join(posixpath.dirname(parent), specifier))
        if candidate.endswith('.js'):
            candidates = [candidate[:-3] + '.d.ts']
        elif candidate.endswith('.mjs'):
            candidates = [candidate[:-4] + '.d.mts']
        elif candidate.endswith(('.d.ts', '.d.mts')):
            candidates = [candidate]
        else:
            candidates = [candidate + '.d.ts', candidate + '/index.d.ts']
        for name in candidates:
            try:
                self.read(name)
                return name
            except (FileNotFoundError, KeyError):
                pass
        raise ValueError('Cannot resolve declaration: ' + specifier)

    def exports(self, entry):
        export = self.manifest.get('exports', {}).get(ENTRIES[entry])
        def types(value):
            if not isinstance(value, dict):
                return None
            if isinstance(value.get('types'), str):
                return value['types']
            return next((found for item in value.values() if (found := types(item))), None)
        filename = types(export)
        if not filename:
            raise ValueError('No public types export for ' + ENTRIES[entry])
        return self.walk(filename.removeprefix('./'), set())

    def walk(self, filename, stack):
        if filename in stack:
            return {}
        text = COMMENTS.sub('', self.read(filename))
        result = {}
        for match in DECL.finditer(text):
            if match['export']:
                result[match['name']] = {'declaration': filename, 'localName': match['name'],
                                         'kind': 'type' if match['kind'] in ('interface', 'type') else 'runtime'}
        for match in re.finditer(r'^export\s+(?:type\s+)?\*\s+from\s+[\'"]([^\'"]+)[\'"]', text, re.M):
            result.update(self.walk(self.resolve(filename, match[1]), stack | {filename}))
        for match in re.finditer(r'^export\s+(?:type\s+)?\{([^}]+)\}(?:\s+from\s+[\'"]([^\'"]+)[\'"])?\s*;', text, re.M):
            source = self.walk(self.resolve(filename, match[2]), stack | {filename}) if match[2] else None
            for item in match[1].split(','):
                bits = item.strip().split()
                if not bits:
                    continue
                type_only = bits[0] == 'type'
                if type_only:
                    bits = bits[1:]
                original = bits[0]
                alias = bits[-1] if len(bits) == 3 and bits[1] == 'as' else original
                if source is not None:
                    if original not in source:
                        raise ValueError('Unsupported re-export: ' + original)
                    result[alias] = dict(source[original])
                else:
                    if original not in declarations(text):
                        resolved = None
                        for imported in re.finditer(r'^import\s+(?:type\s+)?\{([^}]+)\}\s+from\s+[\'"]([^\'"]+)[\'"]', text, re.M):
                            for binding in imported[1].split(','):
                                names = binding.strip().removeprefix('type ').split()
                                if names and names[-1] == original:
                                    linked = self.walk(self.resolve(filename, imported[2]), stack | {filename})
                                    resolved = linked.get(names[0])
                        if resolved is None:
                            raise ValueError('Unsupported local export: ' + original)
                        result[alias] = dict(resolved)
                    else:
                        result[alias] = {'declaration': filename, 'localName': original, 'kind': 'runtime'}
                if type_only:
                    result[alias]['kind'] = 'type'
        return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--entry', choices=list(ENTRIES))
    parser.add_argument('--symbol')
    parser.add_argument('--search')
    parser.add_argument('--limit', type=int, default=20)
    parser.add_argument('--offset', type=int, default=0)
    parser.add_argument('--example', nargs='?', const='auto')
    parser.add_argument('--full', action='store_true')
    parser.add_argument('--file', help='Read a package-relative dist/types/*.d.ts file explicitly')
    parser.add_argument('--project', type=Path)
    parser.add_argument('--library-package', default='auricui')
    args = parser.parse_args()
    if not 1 <= args.limit <= 100 or args.offset < 0:
        parser.error('--limit must be 1..100 and --offset non-negative')
    if args.example and not args.symbol:
        parser.error('--example requires --symbol')
    skill = Path(__file__).resolve().parents[1]
    catalog = json.loads((skill / 'references/api-index.json').read_text())
    package = Package(skill, args.project, args.library_package)
    try:
        version = package.manifest['version']
        print(f'{package.origin} {args.library_package}@{version}')
        if version != catalog['version']:
            print(f'NOTE: descriptions/examples use baseline {catalog["version"]}; declarations below come from the actual package.')
        if args.file:
            if not args.file.startswith('dist/types/') or not args.file.endswith(('.d.ts', '.d.mts')):
                raise ValueError('Expected a relative dist/types/*.d.ts declaration path')
            print(package.read(args.file))
            return 0
        entry = args.entry or 'core'
        entries = [args.entry] if args.entry else (list(ENTRIES) if args.search else [entry])
        records = []
        for group in entries:
            # Older installed versions may lack an optional entry; explicit queries must fail.
            if ENTRIES[group] not in package.manifest.get('exports', {}):
                if args.entry:
                    raise ValueError(f'{group} is not exported by this installed package')
                continue
            baseline = {item['name']: item for item in catalog['entries'].get(group, [])}
            for name, record in package.exports(group).items():
                records.append({**baseline.get(name, {}), **record, 'entry': group, 'name': name})
        if args.symbol:
            record = next((item for item in records if item['name'] == args.symbol), None)
            if record is None:
                print(f'{args.symbol} is not exported by {entry} in this package. Use --search to find another component.')
                return 1
            print(f'{entry}:{record["name"]} -> {record["declaration"]}')
            examples = record.get('examples', [])
            if args.example:
                name = examples[0] if args.example == 'auto' and examples else args.example
                if name not in examples:
                    print('No matching example. Available: ' + (', '.join(examples) or 'none; inspect props and the relevant guide'))
                    return 1
                print(f'Example baseline {catalog["version"]}: {name}')
                print((skill / 'assets/examples/components' / (name + '.tsx')).read_text())
            else:
                text = package.read(record['declaration'])
                print(text if args.full else compact(text, record['localName']))
                if examples:
                    print('\nExamples (load one with --example NAME): ' + ', '.join(examples))
            return 0
        query = (args.search or '').casefold()
        records = [r for r in records if query in ' '.join([r['name'], r.get('description', ''), *r.get('keywords', [])]).casefold()]
        records.sort(key=lambda r: (r['entry'], r['name']))
        for record in records[args.offset:args.offset + args.limit]:
            print(f'{record["entry"]}:{record["name"]} [{record["kind"]}] {record.get("description", "")[:100]}')
        end = min(args.offset + args.limit, len(records))
        print(f'Showing {len(records[args.offset:end])} of {len(records)} results; offset={args.offset}.')
        if end < len(records):
            print(f'Next: --offset {end} --limit {args.limit}')
        return 0
    finally:
        if package.archive:
            package.archive.close()


if __name__ == '__main__':
    try:
        raise SystemExit(main())
    except (OSError, ValueError, KeyError, tarfile.TarError) as error:
        print('API lookup failed: ' + str(error))
        raise SystemExit(2)
