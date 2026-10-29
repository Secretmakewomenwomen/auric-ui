import { ChevronRight } from 'lucide-react';
import type { ApiProp } from './catalog';

export function ApiTable({ props, symbol }: { props: ApiProp[]; symbol: string }) {
  return <div className="docs-api-table">
    <table aria-label={`${symbol} 属性`}>
      <thead><tr><th scope="col">属性</th><th scope="col">类型</th><th scope="col">默认 / 初始值</th><th scope="col">说明</th></tr></thead>
      <tbody>{props.map(prop => <tr key={prop.name}>
        <td><code>{prop.name}</code>{prop.required && <small>必填</small>}{prop.inherited && <small>继承属性</small>}</td>
        <td>{prop.type.length > 65 ? <details><summary aria-label={`展开 ${prop.name} 的完整类型`}><code>{prop.type.slice(0, 62)}…</code><ChevronRight size={12} aria-hidden="true" /></summary><pre>{prop.type}</pre></details> : <code>{prop.type}</code>}</td>
        <td>{prop.defaultValue !== null ? <code>{prop.defaultValue}</code> : <span>{prop.required ? '必填' : '未设置'}</span>}</td>
        <td>{prop.description}</td>
      </tr>)}</tbody>
    </table>
  </div>;
}
