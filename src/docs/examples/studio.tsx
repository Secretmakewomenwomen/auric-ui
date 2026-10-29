import { useEffect, useState, type ComponentProps } from 'react';
import { CardButton } from '../../library/index';
import { Timeline, LayersPanel } from '../../library/studio';

export function TimelineExample() {
  type Tracks = ComponentProps<typeof Timeline>['tracks'];
  const initial: Tracks = [
    {lane:'visual',role:'video',index:0,docIndex:0,name:'画面',badge:'V1',kind:'visual',blocks:[
      {id:'intro',clipId:'intro',loc:'film.html#0.0',title:'开场画面',kind:'video',startMs:0,endMs:4000},
      {id:'detail',clipId:'detail',loc:'film.html#0.1',title:'细节画面',kind:'video',startMs:5000,endMs:10000},
    ]},
    {lane:'audio',role:'audio',index:0,docIndex:1,name:'背景音乐',badge:'A1',kind:'audio',blocks:[
      {id:'music',clipId:'music',loc:'film.html#1.0',title:'背景音乐',kind:'music',startMs:0,endMs:12000},
    ]},
  ];
  const [tracks,setTracks]=useState<Tracks>(initial);
  const [time,setTime]=useState(0);
  const [playing,setPlaying]=useState(false);
  const [selected,setSelected]=useState<readonly string[]>([]);
  const [past,setPast]=useState<Tracks[]>([]);
  const [future,setFuture]=useState<Tracks[]>([]);
  const commit=(next:Tracks)=>{setPast([...past,tracks]);setFuture([]);setTracks(next);};
  useEffect(()=>{
    if(!playing)return;
    let frame=0;
    let previous=performance.now();
    const tick=(now:number)=>{const delta=now-previous;previous=now;setTime(value=>(value+delta)%12000);frame=requestAnimationFrame(tick);};
    frame=requestAnimationFrame(tick);
    return ()=>cancelAnimationFrame(frame);
  },[playing]);
  return <div style={{width:'100%',display:'grid',gap:12}}>
    <p>与专业编辑台使用同一个 Timeline。此独立示例支持定位、缩放、选择、删除、撤销和重做；播放仅演示时间推进，不播放媒体。拖动裁剪及舞台联动请在完整编辑场景体验。</p>
    <div style={{display:'flex',gap:12,alignItems:'center'}}>
      <CardButton onClick={()=>setPlaying(!playing)}>{playing?'暂停':'播放'}</CardButton>
      <CardButton onClick={()=>{setPlaying(false);setTime(0);setTracks(initial);setSelected([]);setPast([]);setFuture([]);}}>重置轨道</CardButton>
      <output aria-label="当前时间">{(time/1000).toFixed(1)} s</output>
    </div>
    <div style={{height:320,minWidth:0,border:'1px solid var(--border)',borderRadius:8,overflow:'hidden'}}>
      <Timeline tracks={tracks} totalMs={12000} timeMs={time} playing={playing}
        onSeek={setTime} onScrubPreview={setTime} onScrubCommit={setTime}
        selected={selected} onSelectedChange={setSelected}
        onRemove={async block=>{commit(tracks.map(track=>({...track,blocks:track.blocks.filter(item=>item.id!==block.id)})));setSelected([]);return null;}}
        onRemoveMany={async blocks=>{const ids=new Set(blocks.map(block=>block.id));commit(tracks.map(track=>({...track,blocks:track.blocks.filter(item=>!ids.has(item.id))})));setSelected([]);return null;}}
        history={{canUndo:past.length>0,canRedo:future.length>0,step:kind=>{
          if(kind==='undo'&&past.length){setFuture([tracks,...future]);setTracks(past[past.length-1]);setPast(past.slice(0,-1));}
          if(kind==='redo'&&future.length){setPast([...past,tracks]);setTracks(future[0]);setFuture(future.slice(1));}
          setSelected([]);
        }}}/>
    </div>
    <p role="status">已选择 {selected.length} 个片段 · <a href="#/scenes">打开专业编辑工作台</a></p>
  </div>;
}

export function LayersPanelExample() {
  type Props = ComponentProps<typeof LayersPanel>;
  type Row = Parameters<Props['onToggle']>[1];
  const [rows,setRows]=useState<Row[]>([
    {handle:1,branch:1,loc:'.title',tag:'h1',kind:'text',label:'主标题',hidden:false,locked:false,off:false,children:[]},
    {handle:2,branch:2,loc:'.cover',tag:'img',kind:'image',label:'封面图片',hidden:false,locked:false,off:false,children:[]},
    {handle:3,branch:3,loc:'.background',tag:'div',kind:'shape',label:'背景',hidden:false,locked:false,off:false,children:[]},
  ]);
  const [selected,setSelected]=useState<Props['selected']>(null);
  const [selectedClipLocs,setSelectedClipLocs]=useState<string[]>([]);
  const [point,setPoint]=useState<string|null>(null);
  const [message,setMessage]=useState('');
  const [open,setOpen]=useState(true);
  const ask:Props['ask']=async <T,>(op:string,args?:object):Promise<T|null>=>{
    if(op==='tree')return [{clip:'scene',kind:'page',layers:rows}] as T;
    if(op==='restack'){
      const order=(args as {order:number[]}).order;
      setRows(current=>order.map(branch=>current.find(row=>row.branch===branch)!).filter(Boolean));
      setMessage('图层顺序已更新（本地示例）');
      return {edits:[]} as T;
    }
    return null;
  };
  return <div style={{width:'100%',display:'grid',gap:12}}>
    <p>与专业编辑台使用同一个 LayersPanel。图层树保存在本地状态，可选择、隐藏、锁定和拖动排序；不连接真实舞台。</p>
    {open?<div style={{height:280,border:'1px solid var(--border)',borderRadius:8,overflow:'auto'}}>
      <LayersPanel ask={ask} timeMs={0} playing={false} filmKey={rows}
        clipOf={()=>({label:'示例场景',kind:'mg',loc:'film.html#scene'})}
        selected={selected} selectedClipLocs={selectedClipLocs}
        onSelectLayer={(clipId,loc)=>{setSelected({clipId,loc});setSelectedClipLocs([]);}}
        onSelectClip={loc=>{setSelected(null);setSelectedClipLocs([loc]);}}
        onPoint={target=>setPoint(target?.loc??null)}
        onToggle={(_clip,row,what)=>setRows(current=>current.map(item=>item.loc===row.loc?{...item,[what]:!item[what]}:item))}
        onRestack={()=>setMessage('图层顺序已更新（本地示例）')}
        onNotify={setMessage} width={300} onClose={()=>setOpen(false)}/>
    </div>:<CardButton onClick={()=>setOpen(true)}>重新打开图层</CardButton>}
    <p role="status">{message||`已选择：${selected?.loc??(selectedClipLocs.length?'示例场景':'无')}；悬停：${point??'无'}`}</p>
  </div>;
}
