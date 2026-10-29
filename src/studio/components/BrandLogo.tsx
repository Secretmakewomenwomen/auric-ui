import { PanelsTopLeft } from 'lucide-react';
/** Product mark is replaceable; layout follows the source component. */
export function BrandLogo({size=18,className=''}:{size?:number;className?:string}){
 return <PanelsTopLeft width={size} height={size} className={`block shrink-0 ${className}`} role="img" aria-label="AuricUI"/>;
}
