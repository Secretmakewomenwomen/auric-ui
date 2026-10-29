import { useMemo, type CSSProperties, type Key, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { classes, useControllable } from '../../agent/shared';
import { Checkbox } from './Checkbox';

export interface TableColumn<T> {
  /** Stable unique column identifier. */
  key: string;
  /** Column heading. */
  title: string;
  /** Render a cell using its row and its displayed index. */
  render: (row: T, index: number) => ReactNode;
  /** Supplying a comparator enables client-side sorting for this column. */
  compare?: (a: T, b: T) => number;
  /** Column width in pixels or a CSS length. */
  width?: CSSProperties['width'];
  /** Text alignment for the header and cells. */
  align?: 'left' | 'center' | 'right';
}
export interface TableSort { key: string; direction: 'asc' | 'desc'; }
export interface TableSelection<T> {
  /** Controlled selected keys; may include rows outside the current page. */
  selectedKeys: readonly Key[];
  /** Receives new keys, preserving selections outside the supplied rows. */
  onChange: (keys: Key[]) => void;
  /** Disable selection for an individual row. */
  isDisabled?: (row: T) => boolean;
  /** Accessible name for a row's checkbox. */
  getLabel: (row: T) => string;
}
export interface TableProps<T> {
  /** Accessible name describing the table. */
  label: string;
  /** Column definitions with unique keys. */
  columns: readonly TableColumn<T>[];
  /** Rows to display. Sorting does not mutate this array. */
  rows: readonly T[];
  /** Stable unique row key; do not use the displayed index. */
  rowKey: (row: T) => Key;
  /** Optional visible caption. */
  caption?: ReactNode;
  /** Controlled sort; null restores the input order. */
  sort?: TableSort | null;
  /** Initial uncontrolled sort. */
  defaultSort?: TableSort | null;
  /** Called when a column cycles ascending, descending, then unsorted. */
  onSortChange?: (sort: TableSort | null) => void;
  /** Enables controlled checkbox selection. Select-all affects eligible supplied rows only. */
  selection?: TableSelection<T>;
  /** Shows a loading row and temporarily disables sorting and selection. */
  loading?: boolean;
  /** Loading message. */
  loadingText?: string;
  /** Content shown when there are no rows. */
  emptyContent?: ReactNode;
  /** Cell spacing. */
  density?: 'comfortable' | 'compact';
  /** Keep column headings visible within the scrolling container. */
  stickyHeader?: boolean;
  /** Maximum scroll container height, in pixels or a CSS length. */
  maxHeight?: CSSProperties['maxHeight'];
  /** Minimum table width; smaller containers scroll horizontally. */
  minWidth?: CSSProperties['minWidth'];
  /** Additional class on the outer wrapper. */
  className?: string;
}

export function Table<T>({label,columns,rows,rowKey,caption,sort,defaultSort=null,onSortChange,selection,loading=false,loadingText='正在加载…',emptyContent='暂无数据',density='comfortable',stickyHeader=false,maxHeight,minWidth,className}:TableProps<T>) {
  const [order,setOrder]=useControllable<TableSort|null>(sort,defaultSort,onSortChange);
  const displayed=useMemo(()=>{
    const compare=columns.find(column=>column.key===order?.key)?.compare;
    return order&&compare?[...rows].sort((a,b)=>compare(a,b)*(order.direction==='asc'?1:-1)):rows;
  },[rows,columns,order]);
  const selected=new Set(selection?.selectedKeys);
  const eligible=rows.filter(row=>!selection?.isDisabled?.(row)).map(rowKey);
  const count=eligible.filter(key=>selected.has(key)).length;
  const changeAll=(checked:boolean)=>{
    if(!selection)return;
    const next=new Set(selection.selectedKeys);
    eligible.forEach(key=>checked?next.add(key):next.delete(key));
    selection.onChange([...next]);
  };
  const span=Math.max(1,columns.length+(selection?1:0));
  return <div className={classes('auricui-table',className)} data-density={density}>
    <div className="auricui-table-scroll" style={{maxHeight}} role="region" aria-label={`${label}滚动区域`} tabIndex={0}>
      <table aria-label={label} aria-busy={loading||undefined} style={{minWidth}}>
        {caption&&<caption>{caption}</caption>}
        <thead data-sticky={stickyHeader}><tr>
          {selection&&<th scope="col" className="auricui-table-select"><Checkbox label={<span className="auricui-table-sr">选择当前数据中的全部可选行</span>} checked={eligible.length>0&&count===eligible.length} indeterminate={count>0&&count<eligible.length} disabled={loading||eligible.length===0} onCheckedChange={changeAll}/></th>}
          {columns.map(column=><th key={column.key} scope="col" style={{width:column.width,textAlign:column.align}} aria-sort={column.compare?(order?.key===column.key?(order.direction==='asc'?'ascending':'descending'):'none'):undefined}>
            {column.compare?<button type="button" className="auricui-table-sort" disabled={loading} onClick={()=>setOrder(order?.key!==column.key?{key:column.key,direction:'asc'}:order.direction==='asc'?{key:column.key,direction:'desc'}:null)}>
              {column.title}{order?.key!==column.key?<ArrowUpDown size={13} aria-hidden="true"/>:order.direction==='asc'?<ArrowUp size={13} aria-hidden="true"/>:<ArrowDown size={13} aria-hidden="true"/>}
            </button>:column.title}
          </th>)}
        </tr></thead>
        <tbody>{loading?<tr><td colSpan={span} className="auricui-table-message">{loadingText}</td></tr>:!displayed.length?<tr><td colSpan={span} className="auricui-table-message">{emptyContent}</td></tr>:displayed.map((row,index)=>{
          const key=rowKey(row);
          return <tr key={key} data-selected={selection?selected.has(key):undefined}>
            {selection&&<td className="auricui-table-select"><Checkbox label={<span className="auricui-table-sr">{selection.getLabel(row)}</span>} checked={selected.has(key)} disabled={selection.isDisabled?.(row)} onCheckedChange={checked=>{const next=new Set(selection.selectedKeys);if(checked)next.add(key);else next.delete(key);selection.onChange([...next]);}}/></td>}
            {columns.map(column=><td key={column.key} style={{textAlign:column.align}}>{column.render(row,index)}</td>)}
          </tr>;
        })}</tbody>
      </table>
    </div>
    <span className="auricui-table-sr" role="status">{loading?loadingText:!rows.length?'暂无数据':`${rows.length} 行数据`}</span>
  </div>;
}
