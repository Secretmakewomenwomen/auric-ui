import { useState, useRef } from 'react';
import { Card, CardActions, CardButton, SettingsField, SettingsSwitch, SettingsSelect, SettingsSegmented, SettingsStatus, SliderField, Tooltip, NumField, ColorPicker, ConfirmDialog, SettingsDialog, Popover, ContextMenu, Toast, useToast, PaneDivider, Section, FontFamilyPicker, Row, SubLabel, MetricField } from '../../library/index';

export function CardButtonExample() {
  const [saved,setSaved]=useState(false);
  return <CardButton weight="primary" onClick={()=>setSaved(!saved)}>{saved?'已保存':'保存'}</CardButton>;
}
export function SettingsFieldExample() {
  const [value,setValue]=useState('');
  return <SettingsField aria-label="项目名称" placeholder="输入项目名称" value={value} onChange={event=>setValue(event.target.value)}/>;
}
export function SettingsSwitchExample() {
  const [checked,setChecked]=useState(true);
  return <SettingsSwitch label="自动保存" checked={checked} onChange={setChecked}/>;
}
export function SettingsSelectExample() {
  const [value,setValue]=useState('balanced');
  return <SettingsSelect label="输出质量" value={value} onChange={setValue} options={[{value:'fast',label:'快速'},{value:'balanced',label:'均衡'},{value:'quality',label:'高质量'}]}/>;
}
export function SettingsSegmentedExample() {
  const [value,setValue]=useState('day');
  return <SettingsSegmented label="时间范围" value={value} onChange={setValue} options={[{value:'day',label:'日'},{value:'week',label:'周'},{value:'month',label:'月'}]}/>;
}
export function SettingsStatusExample() {
  return <SettingsStatus tone="ok">已同步</SettingsStatus>;
}
export function CardExample() {
  const toast=useToast();
  return <><Card title="准备就绪" body="你可以继续编辑，也可以保存当前结果。"><CardActions><CardButton weight="primary" onClick={()=>toast.show('已保存')}>保存</CardButton></CardActions></Card><Toast toast={toast.current}/></>;
}
export function SliderFieldExample() {
  const [value,setValue]=useState(64);
  return <SliderField label="不透明度" value={value} min={0} max={100} unit="%" onCommit={setValue}/>;
}
export function TooltipExample() {
  return <Tooltip label="保存当前修改"><CardButton>保存</CardButton></Tooltip>;
}
export function NumFieldExample() {
  const [value,setValue]=useState(24);
  return <NumField label="字号" value={value} unit="px" min={8} max={96} onCommit={setValue}/>;
}
export function ColorPickerExample() {
  const [value,setValue]=useState('#1a93fe');
  const [open,setOpen]=useState(false);
  return <Popover open={open} onOpenChange={setOpen} trigger={<CardButton>选择颜色</CardButton>}><ColorPicker label="颜色" value={value} onPreview={setValue} onCommit={setValue} onClose={()=>setOpen(false)}/></Popover>;
}
export function FontFamilyPickerExample() {
  const [font,setFont]=useState('Inter');
  const [preview,setPreview]=useState<string>();
  return <div style={{width:260}}><FontFamilyPicker label="字体" value={font} sample="一段文字" className="" onPreview={setPreview} onRevert={()=>setPreview(undefined)} onCommit={setFont}/><p style={{fontFamily:preview??font,marginTop:16}}>一段文字 · AuricUI</p></div>;
}
export function ConfirmDialogExample() {
  const [open,setOpen]=useState(false);
  return <><CardButton onClick={()=>setOpen(true)}>打开确认弹窗</CardButton><ConfirmDialog open={open} title="保存更改？" description="保存当前项目的修改。" onConfirm={()=>setOpen(false)} onCancel={()=>setOpen(false)}/></>;
}
export function SettingsDialogExample() {
  const [open,setOpen]=useState(false);
  return <><CardButton onClick={()=>setOpen(true)}>打开设置</CardButton><SettingsDialog open={open} onClose={()=>setOpen(false)} pages={[{id:'general',title:'通用',group:'设置',icon:null,content:<p>在此组合设置控件。</p>}]}/></>;
}
export function PopoverExample() {
  const [open,setOpen]=useState(false);
  return <Popover open={open} onOpenChange={setOpen} trigger={<CardButton>打开面板</CardButton>}><Card title="快捷操作" body="浮层使用独立的 Card 外观。"><CardActions><CardButton onClick={()=>setOpen(false)}>关闭</CardButton></CardActions></Card></Popover>;
}
export function ContextMenuExample() {
  const [position,setPosition]=useState<{x:number;y:number}|null>(null);
  return <><div tabIndex={0} role="button" onContextMenu={event=>{event.preventDefault();setPosition({x:event.clientX,y:event.clientY});}} onClick={event=>{const rect=event.currentTarget.getBoundingClientRect();setPosition({x:rect.left,y:rect.bottom});}} onKeyDown={event=>{if(event.key==='Enter'){const rect=event.currentTarget.getBoundingClientRect();setPosition({x:rect.left,y:rect.bottom});}}} style={{padding:30,border:'1px dashed var(--border-strong)'}}>右键或点击打开菜单</div>{position&&<ContextMenu {...position} onClose={()=>setPosition(null)} items={[{id:'copy',label:'复制',onSelect:()=>setPosition(null)},{id:'rename',label:'重命名',onSelect:()=>setPosition(null)}]}/>}</>;
}
export function ToastExample() {
  const toast=useToast();
  return <><CardButton onClick={()=>toast.show('配置已保存')}>显示提示</CardButton><Toast toast={toast.current}/></>;
}
export function PaneDividerExample() {
  const ref=useRef<HTMLDivElement>(null);
  const [width,setWidth]=useState(160);
  return <div ref={ref} style={{display:'flex',width:'100%',height:180}}><div style={{width,flexShrink:0,background:'var(--surface-2)',padding:16}}>导航</div><PaneDivider label="调整导航宽度" width={width} onResize={setWidth} containerRef={ref} min={80} minRest={80}/><div style={{flex:1,padding:16}}>内容</div></div>;
}
export function SectionExample() {
  return <Section id="docs-example-section" title="详细设置"><p>按需展开的设置内容。</p></Section>;
}
export function InspectorExample() {
  const [value,setValue]=useState(24);
  const [spacing,setSpacing]=useState(8);
  return <Section id="docs-inspector" title="排版"><SubLabel>字体尺寸</SubLabel><Row><NumField label="字号" value={value} onCommit={setValue}/><NumField label="间距" value={spacing} onCommit={setSpacing}/></Row></Section>;
}

export function MetricFieldExample() {
  const [css,setCss]=useState('normal');
  const [preview,setPreview]=useState<string|null>(null);
  return <div style={{width:240}}><MetricField label="行高" prefix="H" kind="line-height" value={css==='normal'?'auto':{n:Number(css),unit:''}} onPreview={setPreview} onCommit={value=>{setCss(value);setPreview(null);}} onRevert={()=>setPreview(null)}/><p style={{marginTop:12,fontSize:12}}>CSS: {preview??css}</p></div>;
}

export function DangerConfirmExample() {
  const [open,setOpen]=useState(false);
  const [removed,setRemoved]=useState(false);
  return <><CardButton weight="danger" onClick={()=>setOpen(true)}>删除示例项目</CardButton><ConfirmDialog danger open={open} title="删除这个项目？" description="此操作仅删除当前本地示例。" onConfirm={()=>{setRemoved(true);setOpen(false);}} onCancel={()=>setOpen(false)}/><p role="status">{removed?'示例项目已删除':''}</p></>;
}
