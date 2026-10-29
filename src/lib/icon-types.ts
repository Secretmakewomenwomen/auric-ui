import type { ForwardRefExoticComponent, RefAttributes, SVGProps } from 'react';
/** Public icon contract, independent of a particular icon package's type aliases. */
export type IconComponent = ForwardRefExoticComponent<Omit<SVGProps<SVGSVGElement>,'ref'> & RefAttributes<SVGSVGElement> & {size?:string|number;absoluteStrokeWidth?:boolean}>;
