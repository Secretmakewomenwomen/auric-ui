import { Component, type ReactNode } from 'react';

/** A failed scenario must leave the component catalogue usable. */
export class SceneBoundary extends Component<{children:ReactNode;onClose:()=>void},{error:string|null}> {
  state:{error:string|null}={error:null};
  static getDerivedStateFromError(error:unknown){return {error:error instanceof Error?error.message:String(error)};}
  render(){return this.state.error ? <div className="scene-error" role="alert"><strong>场景加载失败</strong><p>{this.state.error}</p><button onClick={this.props.onClose}>返回组件库</button></div> : this.props.children;}
}
