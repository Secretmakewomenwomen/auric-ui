# Component playground

The workbench builds its parameter form from the public TypeScript API and runs the same examples as the documentation.

- `scripts/generate-docs.mjs` extracts prop controls and JSX source locations. It creates ignored copies in `src/docs/generated-playground/` with a docs-only prop bridge. Run `npm run docs:generate` after changing an example or public prop definition.
- `model.ts` owns validated, serializable overrides and generates copyable code. Workbench saves these overrides with its existing workspace configuration.
- `runtime.tsx` connects a session to the first rendered example site for the selected public component. Other example sites stay independent, so disabled comparison controls cannot close an active menu. Controlled callbacks keep the original example behavior and synchronize overridden values back to the form.
- `PlaygroundForm.tsx` renders controls by type. Callbacks, refs, and objects containing functions or JSX remain in the source example. Simple React content can be replaced with text or hidden. JSON syntax errors retain the last valid preview; rendering errors stay inside that card and can be reset.
- Editing a `default*` prop remounts the target and clears its paired controlled value unless that value is explicitly overridden. Full reset remounts the example to restore its initial state.

New library components need a public export, typed props, a registry/catalog entry, and a real example through the public library entry. No component-specific inspector form is required. Composed recipes without a public component API show their source instead.

Run `node --test scripts/playground.test.mjs` for schema/state checks. `npm run check:docs` also compiles representative customized snippets against the packed library with strict TypeScript settings.
