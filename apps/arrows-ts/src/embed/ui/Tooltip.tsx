import type { ReactNode } from 'react';
import { Popup } from 'semantic-ui-react';

interface TooltipProps {
  label: string;
  children: ReactNode;
  placement?: 'bottom' | 'top';
}

export function Tooltip({ label, children, placement = 'bottom' }: TooltipProps): JSX.Element {
  return (
    <Popup
      trigger={<span style={{ display: 'inline-flex' }}>{children}</span>}
      content={label}
      position={`${placement} center`}
      size="mini"
      inverted
    />
  );
}
