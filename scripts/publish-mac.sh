#!/usr/bin/env bash
# Publish from macOS; server deployment is intentionally a separate step.
set -euo pipefail

ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
cd "$ROOT"

usage() {
  cat <<'EOF'
Usage: bash scripts/publish-mac.sh [--release lib|skill|all]

Default: build/check documentation and publish its Docker image.
--release: first increment versions and publish the selected packages to npm.

Required environment: DOCS_IMAGE (registry/repository, without a tag)
Optional environment: DOCS_BUILDER, DOCS_TAG, DOCS_NGINX_IMAGE
DOCS_BUILDER defaults to auricui-private-registry.
Docker Desktop, registry logins and builder CA trust must already be configured.
EOF
}

RELEASE_TARGET=''
while [ "$#" -gt 0 ]; do
  case "$1" in
    --help|-h) usage; exit 0 ;;
    --release)
      if [ "$#" -lt 2 ]; then usage >&2; exit 1; fi
      case "$2" in lib|skill|all) RELEASE_TARGET="$2" ;; *) usage >&2; exit 1 ;; esac
      shift 2 ;;
    *) usage >&2; exit 1 ;;
  esac
done

: "${DOCS_IMAGE:?请设置 DOCS_IMAGE，例如 registry.example.com:5443/auricui-docs}"
export DOCS_BUILDER="${DOCS_BUILDER:-auricui-private-registry}"
export DOCS_TAG="${DOCS_TAG:-docs-$(date -u +%Y%m%dT%H%M%SZ)}"

STAGE='环境检查'
trap 'code=$?; printf "\n失败阶段：%s（退出码 %s）。修复后再继续；已完成的 npm 发布不会撤销。\n" "$STAGE" "$code" >&2; exit "$code"' ERR

command -v node >/dev/null
command -v npm >/dev/null
command -v docker >/dev/null
node --input-type=module -e '
const image = process.env.DOCS_IMAGE;
const tag = process.env.DOCS_TAG;
if (!/^[a-z0-9][a-z0-9._:/-]*\/[a-z0-9][a-z0-9._/-]*$/.test(image) || image.includes("@") || image.split("/").at(-1).includes(":")) {
  throw new Error("DOCS_IMAGE 必须是不带标签的镜像仓库地址");
}
if (!/^[\w][\w.-]{0,127}$/.test(tag) || tag === "latest") {
  throw new Error("DOCS_TAG 必须是独立版本标签；latest 会自动同步");
}
'
docker info >/dev/null
docker buildx inspect "$DOCS_BUILDER" >/dev/null
if [ ! -d node_modules ]; then
  echo '缺少 node_modules，请先执行 npm ci。' >&2
  exit 1
fi

printf '\n镜像：%s:%s\n构建器：%s\n' "$DOCS_IMAGE" "$DOCS_TAG" "$DOCS_BUILDER"
if [ -n "$RELEASE_TARGET" ]; then
  STAGE='npm 发版'
  npm run release -- "$RELEASE_TARGET"
fi

STAGE='构建文档'
npm run build
STAGE='检查文档'
npm run check:docs
STAGE='验证并推送 Docker 镜像'
npm run docker:publish

printf '\nMac 发布流程完成：\n  %s:%s\n  %s:latest\n服务器尚未更新，请自行拉取镜像并重建容器（现有端口映射为 8081:8080）。\n' "$DOCS_IMAGE" "$DOCS_TAG" "$DOCS_IMAGE"
