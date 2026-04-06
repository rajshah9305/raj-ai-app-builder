declare module 'lucide-react/dist/esm/icons/*' {
  import { FC, SVGProps } from 'react';
  const component: FC<SVGProps<SVGSVGElement> & { className?: string }>;
  export default component;
}

declare module 'lucide-react' {
  import { FC, SVGProps } from 'react';
  export type LucideIcon = FC<SVGProps<SVGSVGElement> & { className?: string }>;
  export const AlertTriangleIcon: LucideIcon;
  export const RefreshCwIcon: LucideIcon;
}
