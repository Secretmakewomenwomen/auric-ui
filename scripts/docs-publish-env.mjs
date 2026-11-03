import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseEnv } from 'node:util';

const settings = ['DOCS_IMAGE', 'DOCS_BUILDER', 'DOCS_TAG', 'DOCS_NGINX_IMAGE', 'DOCS_BUILDKIT_IMAGE'];

/** Read data only; never source shell commands from the local configuration. */
export function loadDocsPublishEnv(root, environment = process.env) {
  const file = resolve(root, '.env.publish.local');
  const local = existsSync(file) ? parseEnv(readFileSync(file, 'utf8')) : {};
  const values = {};
  for (const name of settings) {
    const value = environment[name] ?? local[name];
    if (value === undefined) continue;
    if (/[\r\n\0]/.test(value)) throw new Error(`${name} 必须是单行配置值。`);
    values[name] = value;
  }
  return values;
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
    // publish-mac.sh exports each complete assignment without eval or shell expansion.
    for (const [name, value] of Object.entries(loadDocsPublishEnv(root))) console.log(`${name}=${value}`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
