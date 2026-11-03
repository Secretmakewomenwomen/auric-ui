import { useSampleText } from '../studio/lib/sample-i18n';
import { Component, type ReactNode } from 'react';

/** A failed scenario must leave the component catalogue usable. */
export class SceneBoundary extends Component<{children:ReactNode;onClose:()=>void},{error:string|null}> {
  state:{error:string|null}={error:null};
  static getDerivedStateFromError(error:unknown){return {error:error instanceof Error?error.message:String(error)};}
  render(){return this.state.error ? <div className="scene-error" role="alert"><SceneErrorLabel /><p>{this.state.error}</p><button onClick={this.props.onClose}><BackLabel /></button></div> : this.props.children;}
}

function SceneErrorLabel() { const t=useSampleText(); return <strong>{t('场景加载失败')}</strong>; }
function BackLabel() { const t=useSampleText(); return <>{t('返回组件库')}</>; }
