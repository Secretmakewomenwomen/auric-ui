#!/usr/bin/env python3
"""Read AuricUI exports and declarations from an installed package or bundled tarball."""
import argparse
import json
import tarfile
from pathlib import Path, PurePosixPath


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--entry', choices=['core', 'chat', 'studio', 'agent'], default='core')
    parser.add_argument('--symbol')
    parser.add_argument('--file', help='Read a related declaration path, e.g. dist/types/chat/lib/question-types.d.ts')
    parser.add_argument('--project', type=Path)
    parser.add_argument('--library-package', default='auricui')
    args = parser.parse_args()
    skill = Path(__file__).resolve().parents[1]
    index = json.loads((skill / 'references/api-index.json').read_text())
    symbols = index['entries'][args.entry]
    if not args.symbol and not args.file:
        print('Baseline: ' + index['version'])
        for symbol in symbols:
            print(f"{symbol['kind']:7} {symbol['name']} -> {symbol['declaration']}")
        return 0
    match = next((item for item in symbols if item['name'] == args.symbol), None)
    if not args.file and not match:
        print(f'{args.symbol} is not exported by this baseline entry. List exports or inspect the installed entry declaration.')
        return 1
    name = args.file or match['declaration']
    rel = PurePosixPath(name)
    if rel.is_absolute() or '..' in rel.parts or not name.startswith('dist/types/') or not name.endswith(('.d.ts', '.d.mts')):
        raise ValueError('Expected a relative dist/types/*.d.ts declaration path')
    if args.project:
        project = args.project.resolve()
        for parent in [project, *project.parents]:
            manifest = parent / 'node_modules' / args.library_package / 'package.json'
            if manifest.is_file():
                package = manifest.resolve().parent
                version = json.loads(manifest.read_text())['version']
                print(f'Installed {args.library_package}@{version}: {name}')
                if version != index['version']:
                    print('WARNING: index is for ' + index['version'] + '; verify this symbol through the installed exports and entry declarations.')
                print((package / name).read_text())
                return 0
    manifest = json.loads((skill / 'references/library-manifest.json').read_text())
    print(f"Bundled baseline {index['version']}: {name}")
    with tarfile.open(skill / manifest['file'], 'r:gz') as archive:
        member = archive.extractfile('package/' + name)
        if member is None:
            raise ValueError('Declaration is not a file')
        print(member.read().decode())
    return 0


if __name__ == '__main__':
    try:
        raise SystemExit(main())
    except (OSError, ValueError, KeyError, tarfile.TarError) as error:
        print('API lookup failed: ' + str(error))
        raise SystemExit(2)
