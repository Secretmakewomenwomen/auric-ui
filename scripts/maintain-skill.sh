#!/usr/bin/env bash
# Build, verify, optionally publish, and install the exact checked Skill archive.
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: bash scripts/maintain-skill.sh [options]

Default: build the library, sync Skill/API/examples, build docs, and run all checks.
  --publish          Increment and publish auricui-skill to npm, then refresh docs.
  --install-global   Install the checked archive into Codex's global skills directory.
  --install-dir DIR  Install into DIR/auricui (relative to the calling directory).
  --install-only     Skip building/publishing and install the existing checked archive.
                     Requires --install-global or --install-dir.
  --help, -h         Show this help.

Installs back up and replace an existing Skill. Install flags are mutually exclusive.
Requires Node.js 22.12+, npm, Python 3, tar, and dependencies installed with npm ci.
Publishing requires npm login. No Git push, Docker push, or server update is performed.
Edit skills/auricui guides and examples before running: syncing does not write tutorials.
EOF
}

CALLER_DIR="$PWD"
WORKFLOW_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
PUBLISH=0
INSTALL_ONLY=0
INSTALL_MODE=''
INSTALL_DIR=''
while [ "$#" -gt 0 ]; do
  case "$1" in
    --help|-h) usage; exit 0 ;;
    --publish) PUBLISH=1; shift ;;
    --install-only) INSTALL_ONLY=1; shift ;;
    --install-global|--install-dir)
      if [ -n "$INSTALL_MODE" ]; then echo '只能选择一种安装位置。' >&2; exit 1; fi
      INSTALL_MODE="$1"
      if [ "$1" = '--install-dir' ]; then
        if [ "$#" -lt 2 ] || [ -z "$2" ] || [[ "$2" == --* ]]; then
          echo '--install-dir 需要技能父目录。' >&2; exit 1
        fi
        case "$2" in /*) INSTALL_DIR="$2" ;; *) INSTALL_DIR="$CALLER_DIR/$2" ;; esac
        shift
      fi
      shift ;;
    *) printf '未知参数：%s\n' "$1" >&2; usage >&2; exit 1 ;;
  esac
done
if [ "$INSTALL_ONLY" -eq 1 ] && { [ "$PUBLISH" -eq 1 ] || [ -z "$INSTALL_MODE" ]; }; then
  echo '--install-only 必须指定安装位置，且不能与 --publish 同用。' >&2
  exit 1
fi

cd "$WORKFLOW_ROOT"
STAGE='环境检查'
INSTALL_TEMP=''
trap 'if [ -n "$INSTALL_TEMP" ]; then rm -rf -- "$INSTALL_TEMP"; fi' EXIT
trap 'code=$?; printf "\n失败阶段：%s（退出码 %s）。后续步骤已停止。\n若 npm 发布已成功，请勿再次加 --publish；本地安装可用 --install-only 重试。\n" "$STAGE" "$code" >&2; exit "$code"' ERR

command -v node >/dev/null
command -v tar >/dev/null
node -e 'const [major,minor]=process.versions.node.split(".").map(Number); if(major<22 || (major===22 && minor<12)) throw new Error("需要 Node.js 22.12+");'
if [ "$INSTALL_ONLY" -eq 0 ]; then
  command -v npm >/dev/null
  command -v python3 >/dev/null
  if [ ! -d node_modules ]; then echo '缺少依赖，请先执行 npm ci。' >&2; exit 1; fi

  STAGE='构建组件库、同步 Skill 并构建文档'
  printf '\n%s\n' "$STAGE"
  npm run build
  STAGE='组件测试、包消费、文档和 Skill 验证'
  printf '\n%s\n' "$STAGE"
  npm run check

  if [ "$PUBLISH" -eq 1 ]; then
    STAGE='递增版本并发布 Skill 到 npm'
    npm run release:skill
    printf '\nSkill 已发布。以下步骤更新本地产物，不再发布 npm。\n'
    STAGE='刷新新版 Skill 下载和文档站'
    npm run docs:downloads
    node node_modules/vite/bin/vite.js build
    npm run check:docs
  fi
fi

STAGE='定位当前 Skill 安装包'
ARCHIVE=$(node --input-type=module <<'JS'
import fs from 'node:fs';
import path from 'node:path';
const pkg=JSON.parse(fs.readFileSync('packages/auricui-skill/package.json','utf8'));
const manifest=JSON.parse(fs.readFileSync('.verification/skill-pack-manifest.json','utf8'));
const expected=`${pkg.name}-${pkg.version}.tgz`;
if(manifest.filename!==expected) throw new Error('Skill 打包记录与当前版本不一致，请先运行默认工作流。');
const archive=path.resolve('artifacts',expected);
if(!fs.existsSync(archive)) throw new Error('找不到安装包，请先运行默认工作流。');
console.log(archive);
JS
)

if [ -n "$INSTALL_MODE" ]; then
  STAGE='从当前安装包更新本机 Skill'
  INSTALL_TEMP=$(mktemp -d "$WORKFLOW_ROOT/.verification/skill-install.XXXXXX")
  tar -xzf "$ARCHIVE" -C "$INSTALL_TEMP"
  if [ "$INSTALL_MODE" = '--install-global' ]; then
    node "$INSTALL_TEMP/package/bin/install.mjs" --global --update
  else
    node "$INSTALL_TEMP/package/bin/install.mjs" --dir "$INSTALL_DIR" --update
  fi
  printf '\n本机 Skill 已更新，请刷新技能列表或新开 Agent 会话。\n'
fi

printf '\nSkill 工作流完成。\n安装包：%s\n' "$ARCHIVE"
if [ "$PUBLISH" -eq 1 ]; then
  printf '用户更新命令：npx auricui-skill@latest --global --update\n'
elif [ "$INSTALL_ONLY" -eq 0 ]; then
  printf '本次仅构建和验证，未发布 npm。\n'
fi
