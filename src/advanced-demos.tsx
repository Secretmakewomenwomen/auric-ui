import { useEffect, useRef, useState } from "react";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  ArrowUp,
  FileText,
  Keyboard,
  Paperclip,
  Plus,
  RotateCcw,
  Settings2,
  SlidersHorizontal,
  Type,
  X,
} from "lucide-react";
import { CardButton } from "./components/Card";
import {
  NumField,
  MetricField,
  SliderField,
  Section,
  SectionAction,
  Row,
  SubLabel,
  SelectField,
  Segmented,
  ColorField,
  FIELD,
  INPUT,
  FontSizeGlyph,
  LineHeightGlyph,
  LetterSpacingGlyph,
} from "./components/inspector-fields";
import { FontFamilyPicker } from "./components/FontFamilyPicker";
import { metricOf } from "./lib/type-metrics";
import { MIXED } from "./lib/mixed";
import { SettingsDialog } from "./components/settings/SettingsDialog";
import {
  SettingsGroup,
  SettingsItem,
  SettingsSwitch,
  SettingsSegmented,
  SettingsButton,
} from "./components/settings/ui";
import { SettingsSelect } from "./components/settings/SettingsSelect";
import { Markdown } from "./chat/components/Markdown";
import {
  PromptEditor,
  PromptPill,
  PromptPillRevealContext,
  type PromptEditorHandle,
  type PromptEditorState,
  type PromptReference,
  type MentionProvider,
} from "./chat/components/prompt-editor";
import { ComposerNotice } from "./chat/components/NoticeCard";
import {
  AttachmentPreview,
  AttachmentTypeIcon,
  type AttachmentPreviewItem,
} from "./chat/components/AttachmentPreview";
import {
  AttachmentCardBody,
  ATTACHMENT_CARD,
} from "./chat/components/AttachmentCard";
import { ModelPopover } from "./chat/components/ModelPopover";
import {
  ModelOptionsProvider,
  type ModelSelection,
  type RosterAgent,
} from "./chat/lib/model-options";
import type { MenuOption } from "./chat/lib/agent-menu-rows";
import type { ComponentConfig } from "./registry";
import {
  AgentActivityList,
  StatusLine,
  type AgentActivityItem,
} from "./chat/components/AgentActivityRow";
import {
  TurnQuestionCard,
  LocalAgentQuestionCard,
} from "./chat/components/TurnQuestionCard";
import { FileChangesList } from "./chat/components/FileChangesList";
import { BalanceNotice } from "./chat/components/BalanceNotice";
import { ConversationSessionBar } from "./chat/components/ConversationSessionBar";
import type { ProjectSessionItem } from "./chat/lib/project-sessions";

type Props = { config?: ComponentConfig; notify: (message: string) => void };
export const advancedIds = new Set([
  "number",
  "font",
  "slider",
  "markdown",
  "composer",
  "attachment",
  "notice",
  "settings",
  "inspector",
  "metric",
  "model",
  "promptpill",
  "activity",
  "question",
  "filechanges",
  "balance",
  "sessionbar",
]);
export function AdvancedDemo({ id, ...props }: Props & { id: string }) {
  switch (id) {
    case "number":
      return <NumberDemo {...props} />;
    case "font":
      return <FontDemo />;
    case "slider":
      return <SliderDemo {...props} />;
    case "inspector":
      return <InspectorDemo />;
    case "metric":
      return <MetricDemo />;
    case "settings":
      return <SettingsDemo {...props} />;
    case "markdown":
      return <MarkdownDemo {...props} />;
    case "composer":
      return <ComposerDemo {...props} />;
    case "model":
      return <ModelDemo {...props} />;
    case "promptpill":
      return <PillDemo {...props} />;
    case "attachment":
    case "attachmentpreview":
      return <AttachmentDemo {...props} />;
    case "notice":
      return <NoticeDemo {...props} />;
    case "activity":
      return <ActivityDemo />;
    case "question":
      return <QuestionDemo {...props} />;
    case "filechanges":
      return <ChangesDemo />;
    case "balance":
      return (
        <div className="auricui-chat advanced-demo chat-demo">
          <BalanceNotice balance={{ provider: "示例服务" }} />
          <p className="demo-hint">额度不足状态的视觉演示，不连接真实账户。</p>
        </div>
      );
    case "sessionbar":
      return <SessionDemo {...props} />;
  }
  return null;
}
function NumberDemo({ config = {} }: Props) {
  const [number, setNumber] = useState(config.value ?? 64),
    [live, setLive] = useState<number | null>(null),
    [mixed, setMixed] = useState(false);
  useEffect(() => {
    if (config.value != null) setNumber(config.value);
  }, [config.value]);
  return (
    <div className="advanced-demo">
      <NumField
        label={config.label || "宽度"}
        prefix="W"
        value={mixed ? MIXED : number}
        unit="px"
        min={0}
        disabled={config.disabled}
        ctx={{ percent: 1920 }}
        onPreview={setLive}
        onRevert={() => setLive(null)}
        onCommit={(n) => {
          setNumber(n);
          setLive(null);
          setMixed(false);
        }}
      />
      <div className="field-readout">
        {live === null ? "已提交" : "预览中"} <b>{live ?? number} px</b>
      </div>
      <button className="text-btn" onClick={() => setMixed(!mixed)}>
        {mixed ? "恢复单值" : "演示多选混合值"}
      </button>
      <p className="demo-hint">
        拖动 W 调值，或输入 1440/2、+20、50%。Esc 撤回。
      </p>
    </div>
  );
}
function SliderDemo({ config = {} }: Props) {
  const [value, setValue] = useState(config.value ?? 72),
    [preview, setPreview] = useState<number | null>(null);
  useEffect(() => {
    if (config.value != null) setValue(config.value);
  }, [config.value]);
  return (
    <div className="advanced-demo">
      <SliderField
        label="不透明度"
        value={value}
        min={0}
        max={100}
        neutral={100}
        unit="%"
        disabled={config.disabled}
        onPreview={setPreview}
        onRevert={() => setPreview(null)}
        onCommit={(n) => {
          setValue(n);
          setPreview(null);
        }}
      />
      <div
        className="opacity-sample"
        style={{ opacity: (preview ?? value) / 100 }}
      >
        Aa <span>Opacity · {preview ?? value}%</span>
      </div>
      <p className="demo-hint">拖动实时预览，松开提交；双击回到 100%。</p>
    </div>
  );
}
function FontDemo() {
  const [font, setFont] = useState("Inter Variable"),
    [preview, setPreview] = useState<string | null>(null);
  return (
    <div className="advanced-demo">
      <FontFamilyPicker
        label="字体家族"
        value={font}
        sample="让灵感成为作品"
        className={`${FIELD} px-2 text-[11px]`}
        onPreview={setPreview}
        onRevert={() => setPreview(null)}
        onCommit={(next) => {
          setFont(next);
          setPreview(null);
        }}
      />
      <div
        className="font-sample"
        style={{ fontFamily: `"${preview ?? font}", sans-serif` }}
      >
        让灵感成为作品
        <br />
        <span>Design in every detail.</span>
      </div>
      <p className="demo-hint">
        悬停预览 · Enter 应用 · Esc 还原 · 最近使用自动保存
      </p>
    </div>
  );
}
function MetricDemo() {
  const [line, setLine] = useState("1.5"),
    [space, setSpace] = useState("0px"),
    [previewLine, setPreviewLine] = useState<string | null>(null),
    [previewSpace, setPreviewSpace] = useState<string | null>(null);
  return (
    <div className="advanced-demo">
      <Row>
        <MetricField
          label="行高"
          prefix={<LineHeightGlyph />}
          kind="line-height"
          value={metricOf("line-height", line)}
          onPreview={setPreviewLine}
          onRevert={() => setPreviewLine(null)}
          onCommit={(next) => {
            setLine(next);
            setPreviewLine(null);
          }}
        />
        <MetricField
          label="字距"
          prefix={<LetterSpacingGlyph />}
          kind="letter-spacing"
          value={metricOf("letter-spacing", space)}
          onPreview={setPreviewSpace}
          onRevert={() => setPreviewSpace(null)}
          onCommit={(next) => {
            setSpace(next);
            setPreviewSpace(null);
          }}
        />
      </Row>
      <p
        className="metric-sample"
        style={{
          lineHeight: previewLine ?? line,
          letterSpacing: previewSpace ?? space,
        }}
      >
        Great design lives
        <br />
        in the small details.
      </p>
      <p className="demo-hint">支持 Auto、px、%、倍数与键盘微调。</p>
    </div>
  );
}
function InspectorDemo() {
  const [size, setSize] = useState(24),
    [preview, setPreview] = useState<number | null>(null),
    [weight, setWeight] = useState("500"),
    [align, setAlign] = useState("left"),
    [color, setColor] = useState("#dedede");
  return (
    <div className="advanced-demo inspector-demo">
      <Section
        id="demo-typography"
        title="排版"
        aside={
          <SectionAction
            label="重置排版"
            onClick={() => {
              setSize(24);
              setWeight("500");
              setAlign("left");
              setColor("#dedede");
            }}
          >
            <RotateCcw size={12} />
          </SectionAction>
        }
      >
        <Row>
          <NumField
            label="字号"
            prefix={<FontSizeGlyph />}
            value={size}
            min={8}
            max={72}
            onPreview={setPreview}
            onRevert={() => setPreview(null)}
            onCommit={(next) => {
              setSize(next);
              setPreview(null);
            }}
          />
          <SelectField
            label="字重"
            value={weight}
            onCommit={setWeight}
            options={[
              { value: "400", label: "Regular" },
              { value: "500", label: "Medium" },
              { value: "700", label: "Bold" },
            ]}
          />
        </Row>
        <Segmented
          label="文本对齐"
          value={align}
          onChange={setAlign}
          options={[
            { value: "left", label: <AlignLeft size={13} />, title: "左对齐" },
            {
              value: "center",
              label: <AlignCenter size={13} />,
              title: "居中",
            },
            {
              value: "right",
              label: <AlignRight size={13} />,
              title: "右对齐",
            },
          ]}
        />
        <SubLabel>填充颜色</SubLabel>
        <ColorField label="文字颜色" value={color} onCommit={setColor} />
      </Section>
      <div
        className="inspector-sample"
        style={{
          fontSize: preview ?? size,
          fontWeight: Number(weight),
          textAlign: align as "left" | "right" | "center",
          color,
        }}
      >
        Hello, details.
      </div>
    </div>
  );
}
function readSettings() {
  try {
    const saved = JSON.parse(
      (localStorage.getItem("auricui.demo-settings") ?? localStorage.getItem("frame-ui.demo-settings")) ?? "{}"
    );
    return {
      auto: typeof saved.auto === "boolean" ? saved.auto : true,
      quality: ["high", "standard", "auto"].includes(saved.quality)
        ? saved.quality
        : "high",
      density: ["comfortable", "compact"].includes(saved.density)
        ? saved.density
        : "comfortable",
    };
  } catch {
    return { auto: true, quality: "high", density: "comfortable" };
  }
}
function SettingsDemo({ notify }: Props) {
  const [open, setOpen] = useState(false),
    [auto, setAuto] = useState(() => readSettings().auto),
    [quality, setQuality] = useState(() => readSettings().quality),
    [density, setDensity] = useState(() => readSettings().density);
  return (
    <div className="advanced-demo">
      <CardButton onClick={() => setOpen(true)}>
        <Settings2 size={14} />
        打开完整设置
      </CardButton>
      <p className="demo-hint">搜索分区、切换页面、键盘焦点循环及关闭还原。</p>
      <SettingsDialog
        open={open}
        onClose={() => setOpen(false)}
        footer="AuricUI · 本地演示设置"
        pages={[
          {
            id: "general",
            title: "通用",
            group: "设置",
            keywords: "外观 密度 自动保存",
            icon: <Settings2 size={18} />,
            content: (
              <SettingsGroup title="编辑偏好">
                <SettingsItem
                  title="自动保存"
                  description="保留当前编辑中的调整"
                  control={
                    <SettingsSwitch
                      label="设置自动保存"
                      checked={auto}
                      onChange={setAuto}
                    />
                  }
                />
                <SettingsItem
                  title="界面密度"
                  description="调整信息的展示密度"
                  control={
                    <SettingsSegmented
                      label="界面密度"
                      value={density}
                      onChange={setDensity}
                      options={[
                        { value: "compact", label: "紧凑" },
                        { value: "comfortable", label: "舒适" },
                      ]}
                    />
                  }
                />
              </SettingsGroup>
            ),
          },
          {
            id: "preview",
            title: "预览",
            group: "设置",
            keywords: "画质 质量 高清",
            icon: <SlidersHorizontal size={18} />,
            content: (
              <SettingsGroup title="预览质量">
                <SettingsItem
                  title="画质"
                  description="此项为本地组件状态演示"
                  control={
                    <SettingsSelect
                      label="预览画质"
                      value={quality}
                      onChange={setQuality}
                      options={[
                        { value: "auto", label: "自动" },
                        { value: "high", label: "高清" },
                        { value: "standard", label: "标准" },
                      ]}
                    />
                  }
                />
                <SettingsButton
                  onClick={() => {
                    try {
                      localStorage.setItem(
                        "auricui.demo-settings",
                        JSON.stringify({ auto, quality, density })
                      );
                      notify("演示设置已保存在本机");
                    } catch {
                      notify("浏览器无法保存本地设置");
                    }
                  }}
                >
                  应用设置
                </SettingsButton>
              </SettingsGroup>
            ),
          },
          {
            id: "shortcuts",
            title: "快捷键",
            group: "帮助",
            keywords: "键盘 Tab Escape 撤销",
            icon: <Keyboard size={18} />,
            content: (
              <SettingsGroup title="常用操作">
                {[
                  ["关闭浮层", "Esc"],
                  ["下一个焦点", "Tab"],
                  ["上一个焦点", "Shift + Tab"],
                  ["输入框撤销", "⌘ / Ctrl + Z"],
                ].map(([title, key]) => (
                  <SettingsItem
                    key={title}
                    title={title}
                    control={<kbd>{key}</kbd>}
                  />
                ))}
              </SettingsGroup>
            ),
          },
        ]}
      />
    </div>
  );
}
const references: PromptReference[] = [
  {
    id: "file:brief.md",
    kind: "file",
    label: "brief.md",
    detail: "2.4 KB",
    target: { kind: "file", path: "brief.md" },
  },
  {
    id: "element:title",
    kind: "element",
    label: "标题文字",
    detail: "00:04",
    target: { kind: "element", id: "title" },
  },
  {
    id: "skill:dark-ui",
    kind: "skill",
    label: "auricui",
    target: { kind: "skill", name: "auricui" },
  },
];
const mentions: MentionProvider[] = [
  {
    id: "references",
    groupLabel: "项目引用",
    items: references.map((reference) => ({
      ...reference,
      select: () => reference,
    })),
  },
];
const commands: MentionProvider[] = [
  {
    id: "commands",
    groupLabel: "快捷指令",
    items: [
      {
        id: "review",
        kind: "skill",
        label: "review",
        detail: "检查视觉与交互",
        select: () => ({ text: "请检查当前页面的视觉与交互。" }),
      },
    ],
  },
];
function ComposerDemo({ config = {}, notify }: Props) {
  const editor = useRef<PromptEditorHandle>(null),
    [state, setState] = useState<PromptEditorState>({
      text: "",
      references: [],
    });
  const submit = () => {
    if (!state.text.trim()) return;
    notify(
      `已提交本地示例：${state.references.length} 个引用，${state.text.length} 个字符`
    );
    editor.current?.clear();
  };
  return (
    <div className="auricui-chat advanced-demo chat-demo">
      <div className="prompt-demo-card">
        <PromptEditor
          ref={editor}
          defaultValue=""
          references={references}
          onChange={setState}
          onSubmit={submit}
          placeholder={config.label || "描述你的想法，输入 @ 引用…"}
          ariaLabel="富文本提示词"
          minHeight={76}
          maxHeight={180}
          contentClassName="px-3 py-2.5 text-[14px] leading-[1.65]"
          removeLabel="移除引用"
          revealLabel="查看引用"
          onReveal={(reference) => notify(`引用：${reference.label}`)}
          disabled={config.disabled}
          mentions={{ providers: mentions, label: "插入引用" }}
          commands={{ providers: commands, label: "快捷指令" }}
          onPasteFiles={(files) =>
            notify(`已接收 ${files.length} 个粘贴文件（本地演示）`)
          }
        />
        <div className="prompt-demo-toolbar">
          <button
            className="icon-btn"
            aria-label="插入文件引用"
            disabled={config.disabled}
            onClick={() => {
              editor.current?.insertReference(references[0]);
              editor.current?.focus();
            }}
          >
            <Paperclip size={15} />
          </button>
          <span>{state.references.length} 个引用</span>
          <button
            className="send-button"
            aria-label="发送提示词"
            disabled={config.disabled || !state.text.trim()}
            onClick={submit}
          >
            <ArrowUp size={15} />
          </button>
        </div>
      </div>
      <p className="demo-hint">
        @ 引用 · / 指令 · Enter 发送 · Shift + Enter 换行
      </p>
    </div>
  );
}
function PillDemo({ notify }: Props) {
  return (
    <div className="auricui-chat advanced-demo chat-demo">
      <div className="pill-examples">
        {references.map((reference) => (
          <PromptPill
            key={reference.id}
            reference={reference}
            onClick={() => notify(`查看：${reference.label}`)}
            title={`查看 ${reference.label}`}
          />
        ))}
      </div>
      <p className="demo-hint">引用作为整体节点参与选择、删除和撤销。</p>
    </div>
  );
}
const markdownText =
  "### 一个更专注的工作台\n让 **内容** 成为主角，保留 `细节`。\n\n- 统一的颜色变量\n- 自然的状态过渡\n\n> 小变化，也值得认真对待。\n\n| 组件 | 状态 |\n| --- | --- |\n| PromptEditor | Ready |\n| Dialog | Ready |\n\n```tsx\n<Button>继续创作</Button>\n```\n\n参考 [[file:brief.md]]";
function MarkdownDemo({ notify }: Props) {
  const [full, setFull] = useState(false),
    [stream, setStream] = useState(false),
    [length, setLength] = useState(markdownText.length);
  useEffect(() => {
    if (!stream) return;
    const timer = window.setInterval(
      () => setLength((n) => Math.min(markdownText.length, n + 7)),
      40
    );
    return () => clearInterval(timer);
  }, [stream]);
  useEffect(() => {
    if (length === markdownText.length) setStream(false);
  }, [length]);
  return (
    <div className="auricui-chat advanced-demo chat-demo">
      <div className={`markdown-sample ${full ? "is-expanded" : ""}`}>
        <PromptPillRevealContext.Provider
          value={{
            onReveal: (reference) => notify(`查看：${reference.label}`),
            revealLabel: "查看引用",
          }}
        >
          <Markdown text={markdownText.slice(0, length)} />
        </PromptPillRevealContext.Provider>
      </div>
      <div className="demo-actions">
        <button className="text-btn" onClick={() => setFull(!full)}>
          {full ? "收起" : "展开内容"}
        </button>
        <button
          className="text-btn"
          disabled={stream}
          onClick={() => {
            setLength(0);
            setStream(true);
          }}
        >
          模拟流式输出
        </button>
      </div>
    </div>
  );
}
const agents: RosterAgent[] = [
  { id: "codex", name: "Codex", status: "ready" },
  { id: "claude", name: "Claude", status: "ready" },
  { id: "byok", name: "自定义服务", status: "setup" },
];
const modelOptions: MenuOption[] = [
  {
    id: "model",
    name: "模型",
    category: "model",
    options: [
      { value: "balanced", name: "Balanced · 演示模型" },
      { value: "fast", name: "Fast · 演示模型" },
      { value: "quality", name: "Quality · 演示模型" },
    ],
  },
  {
    id: "effort",
    name: "思考强度",
    category: "thought_level",
    options: [
      { value: "medium", name: "中" },
      { value: "high", name: "高" },
      { value: "low", name: "低" },
    ],
  },
  {
    id: "speed",
    name: "速度",
    category: "speed",
    options: [
      { value: "normal", name: "标准" },
      { value: "fast", name: "快速" },
    ],
  },
];
function ModelDemo({ notify }: Props) {
  const [value, setValue] = useState<ModelSelection>({
    agent: "codex",
    prefs: {},
  });
  return (
    <div className="auricui-chat advanced-demo chat-demo">
      <ModelOptionsProvider
        agents={agents}
        options={{ codex: modelOptions, claude: modelOptions }}
        value={value}
        onChange={setValue}
        onOpenSettings={() => notify("这里可接入目标应用的服务设置页")}
      >
        <ModelPopover />
      </ModelOptionsProvider>
      <p className="demo-hint">
        模型、思考强度、速度三级选择。当前使用本地演示目录。
      </p>
      <code className="model-readout">
        {value.agent} / {String(value.prefs[value.agent]?.model ?? "balanced")}
      </code>
    </div>
  );
}
const sampleFiles: AttachmentPreviewItem[] = [
  {
    name: "design-notes.md",
    kind: "document",
    url:
      "data:text/plain;charset=utf-8," +
      encodeURIComponent(
        "# Design notes\n\n保持色彩、留白和动效的一致性。\n\n- React 19\n- Tailwind CSS 4\n- Lexical prompt editor"
      ),
  },
  {
    name: "theme.json",
    kind: "document",
    url:
      "data:application/json;charset=utf-8," +
      encodeURIComponent(
        JSON.stringify({ theme: "dark", accent: "#1a93fe", radius: 8 }, null, 2)
      ),
  },
];
function AttachmentDemo({ notify }: Props) {
  const [items, setItems] = useState<AttachmentPreviewItem[]>(sampleFiles),
    [preview, setPreview] = useState<AttachmentPreviewItem | null>(null);
  const picker = useRef<HTMLInputElement>(null),
    urls = useRef(new Set<string>());
  useEffect(
    () => () => {
      urls.current.forEach((url) => URL.revokeObjectURL(url));
    },
    []
  );
  return (
    <div className="auricui-chat advanced-demo chat-demo">
      <div className="attachment-examples">
        {items.map((item) => (
          <div key={item.url} className="attachment-example">
            <button
              className={ATTACHMENT_CARD}
              onClick={() => setPreview(item)}
              title={`预览 ${item.name}`}
            >
              <AttachmentTypeIcon file={item} size={19} />
              <AttachmentCardBody
                icon={null}
                name={item.name}
                detail="点击预览"
              />
            </button>
            <button
              className="icon-btn"
              aria-label={`移除 ${item.name}`}
              onClick={() => {
                setItems(items.filter((file) => file !== item));
                if (urls.current.has(item.url)) {
                  URL.revokeObjectURL(item.url);
                  urls.current.delete(item.url);
                }
                if (preview === item) setPreview(null);
              }}
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
      <input
        ref={picker}
        type="file"
        multiple
        hidden
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          setItems((old) => [
            ...old,
            ...files.map((file) => {
              const url = URL.createObjectURL(file);
              urls.current.add(url);
              return {
                name: file.name,
                url,
                mediaType: file.type,
                kind: file.type.startsWith("image/")
                  ? ("image" as const)
                  : ("document" as const),
              };
            }),
          ]);
          event.target.value = "";
          notify(`已添加 ${files.length} 个本地文件`);
        }}
      />
      <button className="text-btn" onClick={() => picker.current?.click()}>
        <Plus size={13} />
        添加本地附件
      </button>
      <p className="demo-hint">图片缩放、音视频播放、PDF、文本及 JSON 预览。</p>
      {preview && (
        <AttachmentPreview
          key={preview.url}
          item={preview}
          onClose={() => setPreview(null)}
        />
      )}
    </div>
  );
}
function NoticeDemo({ notify, config = {} }: Props) {
  const [show, setShow] = useState(true),
    [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );
  return (
    <div className="auricui-chat advanced-demo chat-demo">
      {show ? (
        <ComposerNotice
          title={config.label || "需要你的确认"}
          body="这条通知显示在输入区上方，可以关闭或执行操作。"
          primaryLabel={busy ? "处理中…" : "继续"}
          primaryBusy={busy}
          onPrimary={() => {
            setBusy(true);
            timer.current = setTimeout(() => {
              setBusy(false);
              setShow(false);
              notify("示例操作完成");
            }, 650);
          }}
          onDismiss={() => setShow(false)}
        />
      ) : (
        <CardButton onClick={() => setShow(true)}>重新显示通知</CardButton>
      )}
    </div>
  );
}

function ActivityDemo() {
  const [running, setRunning] = useState(false),
    [startedAt, setStartedAt] = useState(Date.now());
  const items: AgentActivityItem[] = [
    {
      id: "thought",
      kind: "thought",
      label: "",
      text: "先确认颜色、排版与组件之间的关系。",
      startedAt: 1000,
      endedAt: 7200,
    },
    {
      id: "read",
      kind: "act",
      label: "act.research.read",
      detail: "design-system.md",
    },
    {
      id: "edit",
      kind: "act",
      label: "act.scene.edit",
      query: "调整按钮与面板的间距",
    },
    {
      id: "plan",
      kind: "plan",
      label: "",
      plan: [
        { content: "核对设计变量", status: "completed" },
        {
          content: "接入组件交互",
          status: running ? "in_progress" : "completed",
        },
      ],
    },
    ...(running
      ? [
          {
            id: "check",
            kind: "act" as const,
            label: "act.film.check",
            pending: true,
            startedAt,
          },
        ]
      : []),
  ];
  return (
    <div className="auricui-chat advanced-demo chat-demo">
      <div className="activity-sample">
        <AgentActivityList items={items} />
        {running && <StatusLine items={items} />}
      </div>
      <button
        className="text-btn"
        onClick={() => {
          setStartedAt(Date.now());
          setRunning(!running);
        }}
      >
        {running ? "完成任务" : "演示运行状态"}
      </button>
    </div>
  );
}
function QuestionDemo({ notify }: Props) {
  const [answer, setAnswer] = useState<string | null>(null),
    [multi, setMulti] = useState(false);
  const question = {
    question: "接下来优先完善什么？",
    options: [
      { label: "基础组件", description: "完善输入与反馈的交互" },
      { label: "编辑器面板", description: "继续接入专业编辑控件" },
    ],
  };
  return (
    <div className="auricui-chat advanced-demo chat-demo">
      {answer ? (
        <>
          <p className="demo-hint">{answer}</p>
          <CardButton onClick={() => setAnswer(null)}>重新回答</CardButton>
        </>
      ) : multi ? (
        <LocalAgentQuestionCard
          questions={[
            {
              id: "scope",
              header: "范围",
              multi: false,
              ...question,
              customId: "other",
            },
            {
              id: "density",
              header: "密度",
              multi: false,
              question: "偏好的布局密度？",
              options: [{ label: "紧凑" }, { label: "舒适" }],
              customId: "other",
            },
          ]}
          onDone={(answers) => {
            setAnswer(
              answers
                ? `已回答 ${Object.keys(answers).length} 个问题`
                : "已跳过问题"
            );
            notify(answers ? "多步骤问答已完成" : "已跳过");
          }}
        />
      ) : (
        <TurnQuestionCard
          ask={question}
          onAnswer={(text) => {
            setAnswer(`已选择：${text}`);
            notify(`已选择：${text}`);
          }}
          onSkip={() => setAnswer("已跳过问题")}
        />
      )}
      <button
        className="text-btn"
        onClick={() => {
          setMulti(!multi);
          setAnswer(null);
        }}
      >
        {multi ? "切换单个问题" : "演示多步骤问答"}
      </button>
    </div>
  );
}
function ChangesDemo() {
  return (
    <div className="auricui-chat advanced-demo chat-demo">
      <FileChangesList
        changes={[
          {
            path: "src/theme.css",
            change: "changed",
            added: 2,
            removed: 1,
            hunks: [
              {
                oldStart: 1,
                oldLines: 3,
                newStart: 1,
                newLines: 4,
                lines: [
                  " :root {",
                  "-  --radius: 6px;",
                  "+  --radius: 8px;",
                  "+  --accent: #1a93fe;",
                  " }",
                ],
              },
            ],
          },
          {
            path: "src/NoticeCard.tsx",
            change: "added",
            added: 3,
            removed: 0,
            hunks: [
              {
                oldStart: 0,
                oldLines: 0,
                newStart: 1,
                newLines: 3,
                lines: [
                  "+export function NoticeCard() {",
                  '+  return <div role="status">Ready</div>;',
                  "+}",
                ],
              },
            ],
          },
          { path: "assets/old-icon.svg", change: "removed" },
        ]}
      />
      <p className="demo-hint">点击文件展开增删行，保留原始差异样式。</p>
    </div>
  );
}
function SessionDemo({ notify }: Props) {
  const [sessions, setSessions] = useState<ProjectSessionItem[]>(() => [
    {
      id: "current",
      title: "组件视觉探索",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      turns: 8,
    },
    {
      id: "previous",
      title: "深色主题方案",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      turns: 4,
    },
  ]);
  const [current, setCurrent] = useState("current");
  return (
    <div className="auricui-chat advanced-demo chat-demo">
      <div className="session-demo-bar">
        <ConversationSessionBar
          sessions={sessions}
          currentSessionId={current}
          onNewSession={() => {
            const id = crypto.randomUUID();
            setSessions((old) => [
              {
                id,
                title: "新的会话",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                turns: 0,
              },
              ...old,
            ]);
            setCurrent(id);
          }}
          onSelectSession={setCurrent}
          onRenameSession={async (title) => {
            setSessions((old) =>
              old.map((item) =>
                item.id === current ? { ...item, title } : item
              )
            );
            notify("会话名称已更新");
          }}
        />
      </div>
      <p className="demo-hint">点击标题重命名，历史支持搜索与日期分组。</p>
      <p className="demo-hint">
        当前会话：{sessions.find((item) => item.id === current)?.title}
      </p>
    </div>
  );
}
