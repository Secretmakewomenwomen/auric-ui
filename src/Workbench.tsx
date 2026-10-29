import { libraryDistribution as library } from './docs/distribution';
import { useEffect, useRef, useState } from "react";
import {
  Boxes,
  Search,
  Grid2X2,
  Star,
  Palette,
  Sparkles,
  BookOpen,
  Download,
  Check,
  Moon,
  Sun,
  ChevronRight,
  Settings2,
  Copy,
  RotateCcw,
  Code2,
  Eye,
  Play,
  X,
} from "lucide-react";
import { entries, categories, type ComponentConfig } from "./registry";
import { Preferences } from "./demos";
import { Preview } from "./docs/Preview";
import { getDoc } from "./docs/catalog";
import { QuickStart } from "./QuickStart";
import { StudioShowcase } from "./StudioShowcase";
import { CardButton } from "./components/Card";
import { MenuSelect } from "./components/MenuSelect";
import { SliderField } from "./components/inspector-fields";
import { SettingsSwitch } from "./components/settings/ui";
import { Toast, useToast } from "./components/Toast";
import { Modal } from "./components/Modal";
import { darkTokens, lightTokens } from "./tokens";
const STORAGE = "auricui.v1";
type Workspace = {
  theme: "dark" | "light";
  components: Record<string, ComponentConfig>;
  favorites: string[];
  tokens: Record<string, string>;
};
const defaults: Workspace = {
  theme: "dark",
  components: {},
  favorites: ["button", "input", "dialog"],
  tokens: {},
};
function read(): Workspace {
  try {
    return {
      ...defaults,
      ...JSON.parse(localStorage.getItem(STORAGE) || localStorage.getItem("frame-ui.v1") || "{}"),
    };
  } catch {
    return defaults;
  }
}
function download(name: string, content: string) {
  const u = URL.createObjectURL(
    new Blob([content], {
      type: name.endsWith(".css") ? "text/css" : "application/json",
    })
  );
  const a = document.createElement("a");
  a.href = u;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(u), 1000);
}
export function Workbench() {
  const [state, setState] = useState<Workspace>(read),
    [page, setPage] = useState("快速开始"),
    [category, setCategory] = useState("全部组件"),
    [query, setQuery] = useState(""),
    [selected, setSelected] = useState("button"),
    [code, setCode] = useState(false),
    [dirty, setDirty] = useState(false),
    [settings, setSettings] = useState(false),
    [replay, setReplay] = useState(0),
    [showPanel, setShowPanel] = useState(true);
  const searchRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const item = entries.find((x) => x.id === selected)!;
  const update = (data: Partial<Workspace>) => {
    setState((s) => ({ ...s, ...data }));
    setDirty(true);
  };
  const favorite = (id: string) =>
    update({
      favorites: state.favorites.includes(id)
        ? state.favorites.filter((x) => x !== id)
        : [...state.favorites, id],
    });
  const save = () => {
    try {
      localStorage.setItem(STORAGE, JSON.stringify(state));
      setDirty(false);
      toast.show("配置已保存到本机");
    } catch {
      toast.showError("保存失败，请导出配置备份");
    }
  };
  useEffect(() => {
    document.documentElement.dataset.theme = state.theme;
    for (const k of Object.keys(darkTokens))
      document.documentElement.style.removeProperty(k);
    for (const [k, v] of Object.entries(state.tokens)) {
      if (CSS.supports("color", v))
        document.documentElement.style.setProperty(k, v);
    }
  }, [state.theme, state.tokens]);
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setPage("组件库");
        requestAnimationFrame(() => searchRef.current?.focus());
      }
      if ((event.metaKey || event.ctrlKey) && event.key === "s") {
        event.preventDefault();
        save();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });
  const list = entries.filter(
    (e) =>
      (page !== "我的收藏" || state.favorites.includes(e.id)) &&
      (category === "全部组件" || e.category === category) &&
      `${e.name} ${e.english}`.toLowerCase().includes(query.toLowerCase())
  );
  const navigate = (p: string, c = "全部组件") => {
    setPage(p);
    setCategory(c);
    setQuery("");
  };
  const isLibrary = page === "组件库" || page === "我的收藏";
  return (
    <div className="studio-app">
      <aside className="sidebar">
        <div className="brand">
          <Boxes size={25} />
          <strong>
            Auric<span>UI</span>
          </strong>
          <small>0.1</small>
        </div>
        <div className="workspace">
          <span>A</span>
          <div>
            <b>我的设计空间</b>
            <small>AuricUI Design System</small>
          </div>
          <ChevronRight size={12} />
        </div>
        <div className="nav-label">工作台</div>
        <nav>
          <button className={page === "快速开始" ? "active" : ""} onClick={() => navigate("快速开始")}><BookOpen size={16} />快速开始</button>
          <button
            className={
              page === "组件库" && category === "全部组件" ? "active" : ""
            }
            onClick={() => navigate("组件库")}
          >
            <Grid2X2 size={16} />
            组件总览<span>{entries.length}</span>
          </button>
          <button
            className={page === "我的收藏" ? "active" : ""}
            onClick={() => navigate("我的收藏")}
          >
            <Star size={16} />
            我的收藏<span>{state.favorites.length}</span>
          </button>
        </nav>
        <div className="nav-label">组件分类</div>
        <nav>
          {categories.map((c, i) => (
            <button
              className={page === "组件库" && category === c ? "active" : ""}
              key={c}
              onClick={() => navigate("组件库", c)}
            >
              {i % 2 ? <Settings2 size={15} /> : <Boxes size={15} />} {c}
              <span>{entries.filter((x) => x.category === c).length}</span>
            </button>
          ))}
        </nav>
        <div className="nav-label">设计基础</div>
        <nav>
          {["设计变量", "动效实验室", "完整场景"].map((p, i) => (
            <button
              className={page === p ? "active" : ""}
              key={p}
              onClick={() => navigate(p)}
            >
              {i === 0 ? (
                <Palette size={16} />
              ) : i === 1 ? (
                <Sparkles size={16} />
              ) : (
                <BookOpen size={16} />
              )}{" "}
              {p}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="system-note">
            <i />
            AuricUI 设计体系<p>把细节，变成一致的体验。</p>
          </div>
          <button onClick={() => setSettings(true)}>
            <Settings2 size={15} />
            工作区设置
            <ChevronRight size={12} />
          </button>
          <div className="user">
            <span>H</span>
            <div>
              本地工作空间<small>所有配置仅保存在本机</small>
            </div>
          </div>
        </div>
      </aside>
      <div className="workspace-main">
        <header className="topbar">
          <div className="breadcrumbs">
            工作空间
            <ChevronRight size={12} />
            设计系统
            <ChevronRight size={12} />
            <b>{page}</b>
          </div>
          <div className="top-actions">
            <span className="save-status">
              <i />
              {dirty ? "有未保存更改" : "已保存到本地"}
            </span>
            <button
              className="icon-btn"
              aria-label="切换明暗主题"
              onClick={() =>
                update({ theme: state.theme === "dark" ? "light" : "dark" })
              }
            >
              {state.theme === "dark" ? <Moon size={15} /> : <Sun size={15} />}
            </button>
            <CardButton
              onClick={() =>
                download("auricui.config.json", JSON.stringify(state, null, 2))
              }
            >
              <Download size={13} />
              导出配置
            </CardButton>
            <CardButton weight="primary" onClick={save}>
              <Check size={13} />
              保存配置
            </CardButton>
          </div>
        </header>
        <div className="content-layout">
          <main className="main-scroll">
            <div className="page-heading">
              <div className="eyebrow">YOUR DESIGN, IN EVERY DETAIL</div>
              <div className="heading-row">
                <h1>
                  {page === "组件库" && category !== "全部组件"
                    ? category
                    : page}
                </h1>
                <span className="pill">React 19 · ESM</span>
              </div>
              <p>
                {page === "快速开始"
                  ? "安装 AuricUI，把这套视觉语言带进你的下一个应用。"
                  : page === "动效实验室"
                  ? "轻盈、克制，让每一次变化自然发生。"
                  : "探索、预览与配置组件。让每一个细节，都保持一致。"}
              </p>
            </div>
            {page === "快速开始" ? (
              <QuickStart onBrowse={(category) => navigate("组件库", category)} notify={toast.show} onError={toast.showError} />
            ) : isLibrary ? (
              <>
                <div className="overview-strip">
                  <div>
                    <Boxes size={17} />
                    <b>{entries.length}</b>交互示例
                  </div>
                  <div>
                    <Grid2X2 size={17} />
                    <b>{categories.length}</b>组件分类
                  </div>
                  <div>
                    <Palette size={17} />
                    <b>{Object.keys(darkTokens).length}</b>设计变量
                  </div>
                  <span>
                    <i />
                    实时交互预览
                  </span>
                </div>
                <div className="library-toolbar">
                  <div className="preview-tabs">
                    <button
                      className={!code ? "active" : ""}
                      onClick={() => setCode(false)}
                    >
                      <Eye size={14} />
                      组件预览
                    </button>
                    <button
                      className={code ? "active" : ""}
                      onClick={() => setCode(true)}
                    >
                      <Code2 size={14} />
                      代码示例
                    </button>
                  </div>
                  <div className="tools">
                    <label className="search">
                      <Search size={14} />
                      <input
                        ref={searchRef}
                        placeholder="搜索组件…"
                        aria-label="搜索组件"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                      <kbd>⌘ K</kbd>
                    </label>
                    <button
                      className="icon-btn"
                      aria-label="切换配置面板"
                      onClick={() => setShowPanel(!showPanel)}
                    >
                      <Settings2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="collection-heading">
                  <span>
                    {category} <b>{list.length}</b>
                  </span>
                  <span>与组件文档共用真实示例</span>
                </div>
                <div className="component-grid">
                  {list.map((entry) => (
                    <article
                      data-component={entry.id}
                      className={`component-card ${
                        selected === entry.id ? "is-selected" : ""
                      }`}
                      key={entry.id}
                      onClick={() => setSelected(entry.id)}
                    >
                      <div className="component-preview">
                        {code ? (
                          <pre className="code-preview">
                            {getDoc(entry).code}
                          </pre>
                        ) : (
                          <Preview
                            entry={entry}
                            notify={toast.show}
                          />
                        )}
                      </div>
                      <div className="component-info">
                        <button
                          className="component-title"
                          onClick={() => {
                            setSelected(entry.id);
                            setShowPanel(true);
                          }}
                        >
                          <b>{entry.name}</b>
                          <span>{entry.english}</span>
                        </button>
                        <button
                          className={`star-btn ${
                            state.favorites.includes(entry.id)
                              ? "is-favorite"
                              : ""
                          }`}
                          aria-label={`收藏${entry.name}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            favorite(entry.id);
                          }}
                        >
                          <Star
                            size={13}
                            fill={
                              state.favorites.includes(entry.id)
                                ? "currentColor"
                                : "none"
                            }
                          />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
                {!list.length && (
                  <div className="empty-search">
                    没有找到组件，请尝试其他关键词。
                  </div>
                )}
                <footer className="page-footer">
                  <span>精于细节，始终一致。</span>
                  <span>AuricUI visual system · {library.version}</span>
                </footer>
              </>
            ) : page === "设计变量" ? (
              <>
                <div className="token-toolbar">
                  <span>
                    主题变量 · {state.theme === "dark" ? "深色" : "浅色"}
                  </span>
                  <CardButton
                    onClick={() =>
                      download(
                        "auricui.tokens.css",
                        `:root {\n${Object.entries({
                          ...(state.theme === "dark"
                            ? darkTokens
                            : lightTokens),
                          ...state.tokens,
                        })
                          .map(([k, v]) => `  ${k}: ${v};`)
                          .join("\n")}\n}`
                      )
                    }
                  >
                    <Download size={13} />
                    导出 CSS
                  </CardButton>
                  <CardButton onClick={() => update({ tokens: {} })}>
                    恢复默认
                  </CardButton>
                </div>
                <div className="token-grid">
                  {Object.entries(
                    state.theme === "dark" ? darkTokens : lightTokens
                  ).map(([k, v]) => (
                    <div className="token-card" key={k}>
                      <div style={{ background: state.tokens[k] || v }} />
                      <code>{k}</code>
                      <input
                        aria-label={k}
                        value={state.tokens[k] ?? v}
                        onChange={(e) =>
                          update({
                            tokens: { ...state.tokens, [k]: e.target.value },
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              </>
            ) : page === "动效实验室" ? (
              <>
                <div className="motion-intro">
                  <span>原生 CSS · 保留原始缓动 · 支持减少动态效果</span>
                  <CardButton
                    weight="primary"
                    onClick={() => setReplay(replay + 1)}
                  >
                    <Play size={12} />
                    全部重播
                  </CardButton>
                </div>
                <div className="motion-grid">
                  {[
                    ["rise", "淡入上移", "400ms"],
                    ["pop", "轻量弹出", "160ms"],
                    ["shimmer", "骨架扫光", "1400ms"],
                    ["sweep", "文字扫光", "1800ms"],
                    ["loading", "加载进度", "1150ms"],
                    ["transition", "状态过渡", "150ms"],
                  ].map(([id, title, duration]) => (
                    <div className="motion-card" key={id}>
                      <div className="motion-stage" key={replay}>
                        {id === "rise" || id === "pop" ? (
                          <div className={`motion-tile auricui-${id}`}>
                            <Boxes size={28} />
                            <span>每一处，都恰到好处</span>
                          </div>
                        ) : id === "shimmer" ? (
                          <div className="skeleton h-12 w-40 rounded-lg" />
                        ) : id === "sweep" ? (
                          <span className="text-sweep">正在让灵感成形…</span>
                        ) : id === "loading" ? (
                          <div className="loading-track">
                            <div className="auricui-loading-bar" />
                          </div>
                        ) : (
                          <CardButton onClick={() => toast.show("状态已更新")}>
                            悬停或点击这里
                          </CardButton>
                        )}
                      </div>
                      <div className="motion-meta">
                        <b>{title}</b>
                        <span>{duration}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : page === "完整场景" ? (
              <StudioShowcase />
            ) : null}
          </main>
          {isLibrary && showPanel && (
            <aside className="inspector">
              <div className="inspector-header">
                <span>
                  <Settings2 size={14} />
                  组件配置
                </span>
                <button
                  className="icon-btn"
                  aria-label="关闭配置面板"
                  onClick={() => setShowPanel(false)}
                >
                  <X size={13} />
                </button>
              </div>
              <div className="inspector-scroll">
                <div className="inspector-title">
                  <div className="selected-icon">
                    <Boxes size={22} />
                  </div>
                  <h2>
                    {item.name}
                    <span>{item.english}</span>
                  </h2>
                  <p>{item.description}</p>
                  <span className="badge">
                    <i />
                    组件示例
                  </span>
                </div>
                <section className="config-section">
                  <h3>示例与 API</h3>
                  <p className="muted">直接操作预览中的控件。此处与文档页面使用相同的组件示例和代码。</p>
                  <a href={`#/components/${item.id}`}>打开完整组件文档</a>
                </section>
                <section className="config-section">
                  <h3>
                    设计规范<span className="subtle">AuricUI</span>
                  </h3>
                  <dl>
                    <div>
                      <dt>字体</dt>
                      <dd>Inter Variable</dd>
                    </div>
                    <div>
                      <dt>基础文字</dt>
                      <dd>
                        {state.tokens["--text"] ||
                          (state.theme === "dark" ? "#DADADA" : "#1F1F1F")}
                      </dd>
                    </div>
                    <div>
                      <dt>面板背景</dt>
                      <dd>
                        {state.tokens["--panel"] ||
                          (state.theme === "dark" ? "#181818" : "#FCFCFC")}
                      </dd>
                    </div>
                    <div>
                      <dt>边框</dt>
                      <dd>
                        {state.theme === "dark" ? "White / 6%" : "Black / 8%"}
                      </dd>
                    </div>
                  </dl>
                </section>
                <section className="config-section">
                  <h3>
                    代码示例
                    <button
                      className="icon-btn"
                      aria-label="复制代码"
                      onClick={() =>
                        navigator.clipboard
                          .writeText(getDoc(item).code ?? '')
                          .then(() => toast.show("代码已复制"))
                          .catch(() => toast.showError("剪贴板不可用"))
                      }
                    >
                      <Copy size={13} />
                    </button>
                  </h3>
                  <pre className="inspector-code">{getDoc(item).code ?? ''}</pre>
                </section>
                <section className="config-section">
                  <h3>源码参考</h3>
                  <code className="source-path">{item.source}</code>
                  <p className="subtle">
                    源自 Skill 内置快照，按当前应用适配。
                  </p>
                </section>
              </div>
              <div className="inspector-bottom">
                修改即时预览，保存后在本机保留
              </div>
            </aside>
          )}
        </div>
      </div>
      <Toast toast={toast.current} />
      {settings && (
        <Modal title="工作区设置" onClose={() => setSettings(false)}>
          <Preferences notify={toast.show} />
        </Modal>
      )}
    </div>
  );
}
