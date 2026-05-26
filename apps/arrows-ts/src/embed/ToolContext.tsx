import { createContext, useContext, useState, type ReactNode } from 'react';

export type Tool = 'select' | 'pan';

interface ToolCtx {
  tool: Tool;
  setTool: (t: Tool) => void;
  /** True only during a temporary spacebar-pan; lets the pan handler distinguish modal vs sticky. */
  spaceHeld: boolean;
  setSpaceHeld: (v: boolean) => void;
}

const Ctx = createContext<ToolCtx | null>(null);

export function ToolProvider({ children }: { children: ReactNode }): JSX.Element {
  const [tool, setTool] = useState<Tool>('select');
  const [spaceHeld, setSpaceHeld] = useState(false);
  return <Ctx.Provider value={{ tool, setTool, spaceHeld, setSpaceHeld }}>{children}</Ctx.Provider>;
}

export function useTool(): ToolCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useTool outside <ToolProvider>');
  return v;
}

export function isPanActive(ctx: Pick<ToolCtx, 'tool' | 'spaceHeld'>): boolean {
  return ctx.tool === 'pan' || ctx.spaceHeld;
}
