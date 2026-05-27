import { useState, type ReactNode } from 'react';

interface TooltipProps {
  label: string;
  children: ReactNode;
  placement?: 'bottom' | 'top';
}

export function Tooltip({ label, children, placement = 'bottom' }: TooltipProps): JSX.Element {
  const [visible, setVisible] = useState(false);
  const tipStyle: React.CSSProperties = {
    position: 'absolute',
    [placement === 'bottom' ? 'top' : 'bottom']: 'calc(100% + 6px)',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#222',
    color: '#fff',
    fontSize: 12,
    lineHeight: 1,
    padding: '5px 8px',
    borderRadius: 3,
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    zIndex: 100,
    boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
  };
  return (
    <span
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && <span style={tipStyle}>{label}</span>}
    </span>
  );
}
