/** Portable shell extracted from OpenFilm SettingsModal; pages belong to the host. */
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Search, X } from "lucide-react";
export interface SettingsPageDefinition {
  id: string;
  title: string;
  group: string;
  keywords?: string;
  icon: ReactNode;
  content: ReactNode;
}
export function SettingsDialog({
  open,
  onClose,
  pages,
  initialPage,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  pages: SettingsPageDefinition[];
  initialPage?: string;
  footer?: ReactNode;
}) {
  const [section, setSection] = useState(initialPage ?? pages[0]?.id);
  const [query, setQuery] = useState("");
  const [shown, setShown] = useState(false);
  const dialog = useRef<HTMLDivElement>(null),
    search = useRef<HTMLInputElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  const titleId = useId();
  useEffect(() => {
    if (open) {
      setSection(initialPage ?? pages[0]?.id);
      setQuery("");
    }
  }, [open, initialPage]);
  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if (event.key === "Escape") {
        event.preventDefault();
        close.current();
      }
      if (
        event.key !== "Tab" ||
        !dialog.current?.contains(document.activeElement)
      )
        return;
      const elements = Array.from(
        dialog.current.querySelectorAll<HTMLElement>(
          'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]'
        )
      ).filter((el) => el.getClientRects().length);
      if (event.shiftKey && document.activeElement === elements[0]) {
        event.preventDefault();
        elements.at(-1)?.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === elements.at(-1)
      ) {
        event.preventDefault();
        elements[0]?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = requestAnimationFrame(() => {
      setShown(true);
      search.current?.focus();
    });
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      cancelAnimationFrame(frame);
      setShown(false);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [open]);
  if (!open) return null;
  const found = pages.filter((page) =>
    `${page.title} ${page.keywords ?? ""}`
      .toLowerCase()
      .includes(query.trim().toLowerCase())
  );
  const showing = found.find((page) => page.id === section) ?? found[0];
  return createPortal(
    <div
      className="settings-backdrop fixed inset-0 z-[10050] grid place-items-center p-6"
      style={{
        background: "rgba(0,0,0,0.5)",
        opacity: shown ? 1 : 0,
        transition: "opacity 160ms ease",
      }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="settings-dialog relative flex h-[min(800px,90vh)] w-full max-w-[1120px] overflow-hidden rounded-[14px] border border-[var(--border)] bg-[var(--dock-pane)] shadow-[0_24px_64px_-12px_rgba(0,0,0,0.5),0_4px_16px_rgba(0,0,0,0.14)]"
        style={{
          opacity: shown ? 1 : 0,
          transform: shown ? "scale(1)" : "scale(0.98)",
          transition: "opacity 160ms ease, transform 200ms ease",
        }}
      >
        <nav
          aria-label="设置"
          className="flex w-[264px] shrink-0 flex-col overflow-y-auto border-r border-[var(--border)] px-3 pb-4 pt-3"
        >
          <label className="mb-3 flex h-10 shrink-0 items-center gap-2.5 rounded-[9px] border border-[var(--border)] px-3 text-[var(--text-muted)] transition focus-within:border-[var(--text-muted)]">
            <Search size={17} strokeWidth={1.75} />
            <input
              ref={search}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索设置"
              aria-label="搜索设置"
              className="min-w-0 flex-1 bg-transparent text-[15px] text-[var(--text)] outline-none placeholder:text-[var(--text-faint)]"
            />
          </label>
          {[...new Set(found.map((page) => page.group))].map((group) => (
            <div key={group} className="mt-3 flex flex-col gap-0.5">
              <div className="px-2.5 pb-1.5 text-[13px] text-[var(--text-faint)]">
                {group}
              </div>
              {found
                .filter((page) => page.group === group)
                .map((page) => (
                  <button
                    key={page.id}
                    type="button"
                    aria-current={showing?.id === page.id ? "page" : undefined}
                    onClick={() => setSection(page.id)}
                    className={`flex h-10 min-w-0 items-center gap-3 rounded-[8px] px-2.5 text-left text-[15px] transition ${
                      showing?.id === page.id
                        ? "bg-[var(--bg-active)] text-[var(--text)]"
                        : "text-[var(--text-dim)] hover:bg-[var(--bg-hover)] hover:text-[var(--text)]"
                    }`}
                  >
                    <span className="shrink-0">{page.icon}</span>
                    <span className="min-w-0 truncate">{page.title}</span>
                  </button>
                ))}
            </div>
          ))}
          {!found.length && (
            <p className="px-2.5 pt-4 text-[14px] text-[var(--text-faint)]">
              没有找到相关设置
            </p>
          )}
          <div className="mt-auto px-2.5 pt-6 text-[13px] text-[var(--text-faint)]">
            {footer}
          </div>
        </nav>
        <div className="relative flex min-w-0 flex-1 flex-col">
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭设置"
            className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-[8px] text-[var(--text-muted)] transition hover:bg-[var(--bg-hover)] hover:text-[var(--text)]"
          >
            <X size={19} />
          </button>
          <div
            key={showing?.id ?? "none"}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-10 pb-12 pt-9"
          >
            <h2
              id={titleId}
              className="mb-7 text-[22px] font-semibold tracking-[-0.015em] text-[var(--text)]"
            >
              {showing?.title ?? "设置"}
            </h2>
            {showing?.content}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
