"""Behavioral checks for the portable Skill query helper."""
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

SKILL = Path(sys.argv.pop(1)).resolve()
spec = importlib.util.spec_from_file_location('skill_query', SKILL / 'scripts/inspect_api.py')
query = importlib.util.module_from_spec(spec)
spec.loader.exec_module(query)


class SkillQueryTests(unittest.TestCase):
    def run_query(self, *args):
        return subprocess.run([sys.executable, str(SKILL / 'scripts/inspect_api.py'), *args], capture_output=True, text=True)

    def test_all_public_exports_are_discoverable_and_queryable(self):
        index = json.loads((SKILL / 'references/api-index.json').read_text())
        package = query.Package(SKILL, None, 'auricui')
        try:
            for entry in query.ENTRIES:
                actual = package.exports(entry)
                self.assertEqual(set(actual), {item['name'] for item in index['entries'][entry]}, entry)
                for name, record in actual.items():
                    with self.subTest(entry=entry, name=name):
                        text = query.compact(package.read(record['declaration']), record['localName'])
                        self.assertIn(record['localName'], text)
        finally:
            package.archive.close()

    def test_target_query_keeps_linked_types_without_unrelated_components(self):
        result = self.run_query('--symbol', 'CardButton')
        self.assertEqual(result.returncode, 0, result.stdout)
        self.assertIn("type Weight = 'primary'", result.stdout)
        self.assertNotIn('function Card(', result.stdout)
        self.assertNotIn('function CardActions(', result.stdout)
        settings = self.run_query('--symbol', 'SettingsButton')
        self.assertEqual(settings.returncode, 0, settings.stdout)
        self.assertIn('ButtonProps', settings.stdout)
        self.assertNotIn('function SettingsSwitch', settings.stdout)

    def test_search_is_bounded_and_examples_are_loaded_explicitly(self):
        result = self.run_query('--search', '表格', '--limit', '1')
        self.assertEqual(result.returncode, 0, result.stdout)
        self.assertIn('core:Table', result.stdout)
        self.assertNotIn('interface TableProps', result.stdout)
        result = self.run_query('--symbol', 'Table', '--example', 'TableStates')
        self.assertEqual(result.returncode, 0, result.stdout)
        self.assertIn('export default function', result.stdout)
        self.assertIn("from 'auricui'", result.stdout)
        self.assertNotIn('function MemoryCard', result.stdout)
        missing = self.run_query('--symbol', 'Table', '--example', 'Nonexistent')
        self.assertEqual(missing.returncode, 1)
        self.assertIn('No matching example', missing.stdout)

    def test_installed_version_and_aliases_override_the_baseline(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            package = root / 'node_modules/auricui'
            (package / 'dist/types').mkdir(parents=True)
            (package / 'package.json').write_text(json.dumps({'version':'99.0.0', 'exports':{'.':{'types':'./dist/types/index.d.ts'}}}))
            (package / 'dist/types/index.d.ts').write_text('export { Table, Added as NewWidget } from "./components.js";\n')
            (package / 'dist/types/components.d.ts').write_text('export interface TableProps { heading: string; }\nexport declare function Table(props: TableProps): void;\nexport declare function Added(value: number): void;\n')
            result = self.run_query('--symbol', 'Table', '--project', folder)
            self.assertEqual(result.returncode, 0, result.stdout)
            self.assertIn('Installed auricui@99.0.0', result.stdout)
            self.assertIn('heading: string', result.stdout)
            self.assertNotIn('rowKey', result.stdout)
            result = self.run_query('--symbol', 'NewWidget', '--project', folder)
            self.assertEqual(result.returncode, 0, result.stdout)
            self.assertIn('function Added(value: number)', result.stdout)
            result = self.run_query('--symbol', 'MemoryCard', '--entry', 'agent', '--project', folder)
            self.assertEqual(result.returncode, 2)
            self.assertIn('not exported', result.stdout)

    def test_invalid_lookup_does_not_fall_back_to_another_component(self):
        self.assertEqual(self.run_query('--symbol', 'NotAComponent').returncode, 1)
        self.assertNotEqual(self.run_query('--file', 'dist/types/../../../package.json').returncode, 0)
        self.assertNotEqual(self.run_query('--limit', '0').returncode, 0)
        self.assertNotEqual(self.run_query('--example').returncode, 0)


if __name__ == '__main__':
    unittest.main()
