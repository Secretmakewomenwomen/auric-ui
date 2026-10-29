#!/usr/bin/env python3
"""Read-only dependency audit for an AuricUI frontend; standard library only."""
import argparse
import json
import re
from pathlib import Path


def find_package(project, name):
    for parent in [project.resolve(), *project.resolve().parents]:
        candidate = parent / 'node_modules' / name / 'package.json'
        if candidate.is_file():
            return candidate.resolve()
    return None


def inspect(project, mode='package', library_package='auricui'):
    manifest = json.loads((project / 'package.json').read_text())
    declared = {**manifest.get('dependencies', {}), **manifest.get('devDependencies', {})}
    required = {'react': 19, 'react-dom': 19, 'tailwindcss': 4, 'typescript': None,
                'lucide-react': None, '@fontsource-variable/inter': None,
                '@types/react': 19, '@types/react-dom': 19}
    if mode == 'package':
        required = {'react': 19, 'react-dom': 19, library_package: None}
        if 'typescript' in declared or any(project.glob('tsconfig*.json')):
            required.update({'typescript': None, '@types/react': 19, '@types/react-dom': 19})
    elif 'vite' in declared or not any(x in declared for x in ['next', 'react-scripts', '@remix-run/react']):
        required.update({'vite': None, '@vitejs/plugin-react': None, '@tailwindcss/vite': 4})
    optional = ['gsap', 'framer-motion', 'motion', 'zustand', 'lexical', '@lexical/react']
    if mode == 'package':
        optional = [name for name in optional if name not in ['lexical', '@lexical/react']]
    checks = []
    for name in [*required, *optional]:
        installed = None
        for parent in [project, *project.parents]:
            location = parent / 'node_modules' / name / 'package.json'
            if location.is_file():
                try:
                    installed = json.loads(location.read_text()).get('version')
                except (OSError, ValueError):
                    pass
                break
        status = 'optional' if name in optional else 'ok'
        message = '按实际功能使用' if name in optional else '已声明且已安装'
        if name in required:
            if name not in declared:
                status, message = 'missing', '目标 package.json 缺少声明'
            elif not installed:
                status, message = 'missing', '已声明但没有找到实际安装'
            elif required[name] is not None:
                match = re.match(r'^(\d+)\.', installed)
                if not match or int(match.group(1)) != required[name]:
                    status, message = 'mismatch', f'默认基线为主版本 {required[name]}；适配或升级需结合用户技术栈'
                declared_major = re.match(r'^[~^]?(\d+)(?:\.|$)', str(declared[name]))
                if declared_major and int(declared_major.group(1)) != required[name]:
                    status, message = 'mismatch', f'清单声明 {declared[name]} 不符合默认主版本 {required[name]}'
        checks.append({'package': name, 'declared': declared.get(name), 'installed': installed,
                       'status': status, 'message': message})
    if mode == 'package':
        location = find_package(project, library_package)
        if location:
            library = json.loads(location.read_text())
            base = location.parent
            exports = library.get('exports', {})
            for key in ['.', './agent', './chat', './studio', './styles.css']:
                entry = exports.get(key)
                paths = [entry] if isinstance(entry, str) else [entry.get('import'), entry.get('types')] if isinstance(entry, dict) else []
                ok = bool(paths) and all(isinstance(p, str) and (base / p).is_file() for p in paths)
                checks.append({'package': library_package + ':' + key, 'status': 'ok' if ok else 'missing', 'message': '公开入口存在' if ok else '公开入口或产物缺失，请检查当前版本的 exports'})
            for name in library.get('dependencies', {}):
                dependency = find_package(base, name)
                checks.append({'package': name + ' (transitive)', 'status': 'ok' if dependency else 'missing', 'message': '包依赖已安装' if dependency else '组件库依赖未找到，请用包管理器完整安装'})
            checks.append({'package': library_package + ':ESM', 'status': 'ok' if library.get('type') == 'module' else 'mismatch', 'message': '期望 type=module，消费方使用 ESM import'})
    versions = {row['package']: row.get('installed') for row in checks}
    if versions.get('react') and versions.get('react-dom') and versions['react'] != versions['react-dom']:
        checks.append({'package': 'react/react-dom', 'status': 'mismatch', 'message': 'React 与 React DOM 实际版本不一致'})
    return {'project': str(project), 'mode': mode, 'passed': all(c['status'] in ['ok', 'optional'] for c in checks),
            'checks': checks, 'manual_checks': ['AuricUI 组件按需移植与依赖适配',
            'Tailwind 4 插件、扫描路径和样式导入', 'Inter 字体导入与中文回退',
            '首屏 data-theme=dark', 'CSS keyframes、transition、reduced-motion', 'Portal 作用域与主题继承'] if mode == 'source' else
            ['ESM 入口与 styles.css 导入', '首屏 data-theme=dark', '.auricui-chat 与 Portal 容器',
             '按需注入业务服务', 'CSS 动画与 reduced-motion']}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--project', type=Path, required=True)
    parser.add_argument('--json', action='store_true')
    parser.add_argument('--mode', choices=['source', 'package'], default='package')
    parser.add_argument('--library-package', default='auricui')
    args = parser.parse_args()
    try:
        result = inspect(args.project.resolve(), args.mode, args.library_package)
    except (OSError, ValueError, TypeError) as exc:
        print(json.dumps({'error': str(exc)}, ensure_ascii=False))
        return 2
    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        print('AuricUI 依赖检查：' + result['project'])
        for item in result['checks']:
            version = f": {item.get('installed') or '未安装'}" if 'installed' in item else ''
            print(f"[{item['status']}] {item['package']}{version} — {item['message']}")
        print('仍需人工检查：' + '；'.join(result['manual_checks']))
    return 0 if result['passed'] else 1


if __name__ == '__main__':
    raise SystemExit(main())
