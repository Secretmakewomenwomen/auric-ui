import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { generated, playgroundModel as model, playgroundExamples } from './playground-cases.mjs';

const props = symbol => generated.api[`auricui:${symbol}`].props;
const prop = (symbol, name) => props(symbol).find(prop => prop.name === name);

test('parameter controls resolve aliases, native input unions, booleans and callbacks', () => {
  assert.deepEqual(prop('Tag', 'tone').control.options, ['danger', 'neutral', 'info', 'success', 'warning']);
  assert.equal(prop('SettingsField', 'value').control.kind, 'text');
  assert.equal(prop('SettingsField', 'type').control.kind, 'text');
  assert.equal(prop('SettingsSelect', 'value').control.kind, 'text');
  assert.equal(prop('SettingsSegmented', 'value').control.kind, 'text');
  assert.equal(prop('NumField', 'value').control.kind, 'number');
  assert.equal(prop('Tag', 'checked').control.kind, 'boolean');
  assert.equal(prop('Tag', 'children').control.kind, 'node');
  assert.equal(prop('Tag', 'onClose').control.kind, 'readonly');
  assert.equal(prop('Table', 'rows').control.kind, 'json');
});

test('sessions isolate components, validate saved overrides, and restore sample values', () => {
  const changes = [];
  const first = model.createPlaygroundSession('auricui:Tag', props('Tag'), { tone: 'invalid', checked: true, onClose: 'invalid' }, value => changes.push(value));
  const other = model.createPlaygroundSession('auricui:Tag', props('Tag'), {}, () => {});
  assert.deepEqual(first.getSnapshot().overrides, { checked: true });
  first.capture('one', { children: '原始内容', tone: 'info', icon: null, onClose() {} });
  first.capture('two', { children: '对照内容', disabled: true }, 'secondary-example');
  assert.equal(first.getSnapshot().site, 'one');
  assert.equal(model.fieldValue(prop('Tag', 'children'), first.getSnapshot()), '原始内容');
  assert.equal(model.fieldValue(prop('Tag', 'icon'), first.getSnapshot()), null);
  assert.equal(model.fieldValue(prop('Tag', 'visible'), first.getSnapshot(), props('Tag')), true);
  first.set('children', '修改内容');
  assert.equal(model.fieldValue(prop('Tag', 'children'), first.getSnapshot()), '修改内容');
  assert.deepEqual(other.getSnapshot().overrides, {});
  first.clear('children');
  assert.equal(model.fieldValue(prop('Tag', 'children'), first.getSnapshot()), '原始内容');
  const previous = first.getSnapshot();
  first.capture('one', { children: '原始内容', tone: 'info', icon: null, onClose() {} });
  assert.equal(first.getSnapshot(), previous, 'new callback identities must not trigger render loops');
  first.reset();
  assert.deepEqual(first.getSnapshot().overrides, {});
  assert.equal(first.getSnapshot().recovery, 1);
  first.release('one');
  assert.equal(first.getSnapshot().site, 'secondary-example');
  first.release('two');
  assert.equal(first.getSnapshot().mounted, false);
  assert.ok(changes.length >= 3);
});

test('structured data rejects callbacks, React elements and unsafe object keys', () => {
  assert.deepEqual(model.jsonValue({ rows: [{ id: '1' }], unused: undefined }), { rows: [{ id: '1' }] });
  assert.equal(model.jsonValue({ handler() {} }), undefined);
  assert.equal(model.jsonValue({ $$typeof: Symbol.for('react.transitional.element') }), undefined);
  assert.equal(model.jsonValue(JSON.parse('{"__proto__":{}}')), undefined);
  assert.equal(model.jsonValue([Infinity]), undefined);
});

test('inspector dismissal protection lasts only for the current input event', async () => {
  const session = model.createPlaygroundSession('auricui:Dropdown', props('Dropdown'), {}, () => {});
  session.inspectEvent(true);
  assert.equal(session.shouldIgnoreDismiss(), true);
  session.set('open', false);
  assert.equal(session.getSnapshot().overrides.open, false, 'explicit form edits still apply');
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(session.shouldIgnoreDismiss(), false, 'Escape and real outside clicks must still dismiss');
});

test('controlled value bindings preserve native event semantics and close dialogs', () => {
  assert.deepEqual(model.eventBindings(props('SettingsField'), { value: 'x' }), [{ event: 'onChange', prop: 'value', extract: 'event' }]);
  assert.deepEqual(model.eventBindings(props('SettingsSwitch'), { checked: true }), [{ event: 'onChange', prop: 'checked', extract: 'first' }]);
  assert.ok(model.eventBindings(props('ConfirmDialog'), { open: true }).some(binding => binding.event === 'onCancel' && binding.extract === 'close'));
  assert.deepEqual(model.uncontrolledProps({ defaultValue: 'a', defaultChecked: true, checked: false }), ['value']);
});

test('generated code covers controlled states, children, callbacks and initial values without syntax errors', () => {
  for (const [name, code] of Object.entries(playgroundExamples)) {
    const parsed = ts.createSourceFile(name + '.tsx', code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    assert.deepEqual(parsed.parseDiagnostics.map(diagnostic => diagnostic.messageText), [], name);
    assert.ok(code.includes('playgroundProps'), name);
  }
  assert.ok(playgroundExamples.Playground_SettingsField_1.includes('args[0].target.value'));
  assert.ok(playgroundExamples.Playground_SettingsField_2.includes('value={undefined}'));
  assert.ok(playgroundExamples.Playground_Tag_7.includes('{playgroundProps.children}'));
  assert.equal((playgroundExamples.Playground_Dropdown_11.match(/\{\.\.\.playgroundProps\}/g) ?? []).length, 1, 'comparison examples must keep independent state');
});
