# Documentation languages

The documentation defaults to English and stores `en` or `zh-CN` in `auricui.docs.locale`. The provider updates the document language and the shared component, Chat, and Studio locale contexts.

- `en.json` translates documentation labels and API descriptions. Keep navigation labels short enough for one sidebar row.
- `examples.en.json` translates the canonical examples in `src/docs/examples`. `npm run docs:generate` compiles English examples, copyable snippets, and playground bindings together. Missing demo translations fail generation. Translate whole template strings with `${0}`, `${1}`, etc. for their expression placeholders.
- Library-owned defaults use `src/i18n/ui.ts`; custom labels and user input are preserved. Standalone components retain their existing language when no context is provided.
- Full application examples use `src/studio/lib/sample-i18n.ts`. The in-memory Studio runtime accepts `{ locale }` as its third argument.

Language changes preserve the current documentation route and playground overrides. Each language supplies fresh demo content; user-entered overrides are applied unchanged. Generated code uses the current language and those same overrides.

`node --test scripts/docs-locale.test.mjs` checks the default preference, translation coverage, English SSR for every demo, and explicit-label preservation. `npm run check:docs` typechecks both languages against the packed library.
