import { useLayoutEffect, type ReactNode } from 'react';

/** Mount once at the app root; set data-theme in the initial HTML to prevent a flash. */
export function AuricUIProvider({children,theme='dark'}:{children:ReactNode;theme?:'dark'|'light'}){
 useLayoutEffect(()=>{document.documentElement.dataset.theme=theme;},[theme]);
 return <>{children}<div id="auricui-chat-layer" className="auricui-chat"/></>;
}
