import { useState } from "react";
import coverage from "./component-coverage.json";
const labels: Record<string, string> = {
  ported: "已移植",
  adapted: "已适配",
  partial: "部分完成",
  pending: "待接入",
};
export function Coverage({ onExample }: { onExample: (id: string) => void }) {
  const [filter, setFilter] = useState("all"),
    [query, setQuery] = useState("");
  const rows = coverage.filter(
    (row) =>
      (filter === "all" || row.status === filter) &&
      row.id.toLowerCase().includes(query.toLowerCase())
  );
  return (
    <div className="coverage-page">
      <div className="coverage-stats">
        {Object.entries(labels).map(([key, label]) => (
          <button
            key={key}
            className={filter === key ? "active" : ""}
            onClick={() => setFilter(filter === key ? "all" : key)}
          >
            <strong>
              {coverage.filter((row) => row.status === key).length}
            </strong>
            <span>{label}</span>
          </button>
        ))}
      </div>
      <p className="coverage-note">
        以 Skill 快照中 {coverage.length}{" "}
        个导出模块为基准，包含业务页面和支持模块。“已移植”表示源码和预览已接入；像素一致性仍需逐项对比验证。
      </p>
      <input
        className="coverage-search"
        aria-label="搜索原始模块"
        value={query}
        placeholder="搜索原始模块名称…"
        onChange={(event) => setQuery(event.target.value)}
      />
      <div className="coverage-table">
        <table>
          <thead>
            <tr>
              <th>原始模块</th>
              <th>状态</th>
              <th>预览 / 说明</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>
                  <span className="coverage-area">{row.area}</span>
                  <code>{row.name}</code>
                </td>
                <td>
                  <span className={`coverage-status ${row.status}`}>
                    {labels[row.status]}
                  </span>
                </td>
                <td>
                  {row.examples
                    .filter((id) => id !== "global")
                    .map((id) => (
                      <button key={id} onClick={() => onExample(id)}>
                        {id} ↗
                      </button>
                    ))}
                  {row.note && <small>{row.note}</small>}
                  {row.examples.length === 0 && (
                    <span className="subtle">待接入展示平台</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <p className="coverage-note">没有找到匹配的模块。</p>}
      </div>
    </div>
  );
}
