import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const image = process.env.DOCS_IMAGE;
const tag = process.env.DOCS_TAG || `docs-${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')}`;
const builder = process.env.DOCS_BUILDER || 'auricui-docs-builder';
const buildkitImage = process.env.DOCS_BUILDKIT_IMAGE || 'docker.xuanyuan.run/moby/buildkit:buildx-stable-1';
const baseImageArgs = process.env.DOCS_NGINX_IMAGE ? ['--build-arg', `NGINX_IMAGE=${process.env.DOCS_NGINX_IMAGE}`] : [];
const localImage = `auricui-docs-check:${process.pid}`;

function docker(args, { capture = false, allowFailure = false } = {}) {
  const result = spawnSync('docker', args, {
    cwd: root,
    stdio: capture ? 'pipe' : 'inherit',
    encoding: 'utf8',
  });
  if (result.error) throw result.error;
  if (result.status !== 0 && !allowFailure) {
    throw new Error(`docker ${args[0]} 失败（退出码 ${result.status ?? result.signal}），未完成发布。`);
  }
  return result;
}

// These are container shell arguments, not interpolated host shell commands.
const quote = (value) => `'${value.replaceAll("'", "'\\''")}'`;

function checkDist() {
  const index = resolve(root, 'dist/index.html');
  if (!existsSync(index)) throw new Error('缺少 dist/index.html，请先执行 npm run build。');
  const html = readFileSync(index, 'utf8');
  const paths = [...new Set([...html.matchAll(/(?:src|href)="(\/[^"?#]+)/g)].map((match) => match[1]))];
  if (!paths.some((path) => path.startsWith('/assets/') && path.endsWith('.js'))) {
    throw new Error('dist/index.html 没有引用已打包的 /assets/*.js，请先完成前端构建。');
  }
  const downloads = resolve(root, 'dist/downloads');
  if (!existsSync(downloads)) throw new Error('缺少 dist/downloads，请重新执行 npm run build。');
  paths.push(...readdirSync(downloads).filter((name) => name.endsWith('.tgz')).map((name) => `/downloads/${name}`));
  paths.push('/demo-film/assets/poster.svg', '/demo-film/assets/tone.wav', '/demo-film/scenes/intro.html', '/demo-film/scenes/details.html');
  for (const path of paths) {
    if (!existsSync(resolve(root, `dist${path}`))) throw new Error(`缺少构建资源：dist${path}`);
  }
  return paths;
}

try {
  if (!image) throw new Error('请通过 DOCS_IMAGE 指定镜像仓库，例如 DOCS_IMAGE=docker.io/YOUR_USERNAME/auricui-docs npm run docker:publish。');
  if (!/^[a-z0-9][a-z0-9._:/-]*\/[a-z0-9][a-z0-9._/-]*$/.test(image) || image.includes('@') || image.split('/').at(-1).includes(':')) {
    throw new Error('DOCS_IMAGE 应为不带标签的镜像地址，例如 docker.io/YOUR_USERNAME/auricui-docs。');
  }
  if (!/^[\w][\w.-]{0,127}$/.test(tag) || tag === 'latest') {
    throw new Error('DOCS_TAG 应为独立版本标签，例如 docs-20261029-140000；latest 会自动同步。');
  }
  const paths = checkDist();
  console.log(`使用已有 dist，准备发布 ${image}:${tag} 和 ${image}:latest`);

  docker(['info', '--format', '{{.ServerVersion}}']);
  const existing = docker(['buildx', 'inspect', builder], { capture: true, allowFailure: true });
  if (existing.status !== 0) {
    if (process.env.DOCS_BUILDER) throw new Error('指定的 DOCS_BUILDER 不存在或不可访问，请先创建并配置该 builder。');
    docker(['buildx', 'create', '--name', builder, '--driver', 'docker-container', '--driver-opt', `image=${buildkitImage}`]);
  }

  // First load a native image for real Nginx/HTTP checks. The multi-platform push reuses its build cache.
  const arch = process.arch === 'arm64' ? 'arm64' : process.arch === 'x64' ? 'amd64' : null;
  if (!arch) throw new Error(`本机架构 ${process.arch} 暂不支持此发布脚本。`);
  docker(['buildx', 'build', '--builder', builder, '--platform', `linux/${arch}`, ...baseImageArgs, '--pull', '--load', '--tag', localImage, '.']);
  try {
    const asset = paths.find((path) => path.startsWith('/assets/') && path.endsWith('.js'));
    const base = 'http://127.0.0.1:8080';
    const smoke = [
      'nginx -t',
      'nginx',
      "trap 'nginx -s quit' EXIT",
      `wget -q -O - ${quote(`${base}/healthz`)} | grep -x ok`,
      `wget -S -O /dev/null ${quote(`${base}/`)} 2>&1 | grep -F 'Cache-Control: no-cache'`,
      `wget -S -O /dev/null ${quote(base + asset)} 2>&1 | grep -F 'max-age=31536000, immutable'`,
      ...paths.map((path) => `wget -q -O /dev/null ${quote(base + path)}`),
      `wget -q -O - ${quote(`${base}/api/projects/demo/poster`)} | grep -q '<svg'`,
      `wget -q -O - ${quote(`${base}/api/projects/demo/file?path=scenes%2Fintro.html`)} | grep -qi '<!doctype html'`,
      `wget -q -O - ${quote(`${base}/api/saved/file?path=scenes%2Fdetails.html`)} | grep -qi '<!doctype html'`,
      ...['/assets/not-found.js', '/downloads/not-found.tgz', '/api/not-found', '/api/projects/demo/media?what=wave&path=assets%2Ftone.wav'].map((path) =>
        `wget -S -O /dev/null ${quote(base + path)} 2>&1 | grep -F '404 Not Found'`),
      'echo "Nginx、页面、缓存头、下载、演示素材和 404 检查通过。"',
    ].join('\n');
    docker(['run', '--rm', localImage, 'sh', '-ec', smoke]);
  } finally {
    docker(['image', 'rm', localImage], { capture: true, allowFailure: true });
  }

  docker([
    'buildx', 'build', '--builder', builder,
    '--platform', 'linux/amd64,linux/arm64',
    ...baseImageArgs,
    '--tag', `${image}:${tag}`, '--tag', `${image}:latest`, '--push', '.',
  ]);
  docker(['buildx', 'imagetools', 'inspect', `${image}:${tag}`]);
  console.log(`\n已推送：${image}:${tag}\n服务器执行：\ndocker pull ${image}:${tag}\ndocker run -d --name auricui-docs --restart unless-stopped -p 8080:8080 ${image}:${tag}`);
} catch (error) {
  console.error(`\n${error.message}`);
  process.exitCode = 1;
}
