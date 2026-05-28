import { useDispatch } from 'react-redux';

export type ThunkAction<R = unknown> = (
  dispatch: AppDispatch,
  getState: () => unknown
) => R;

export type AppAction = ThunkAction | { type: string; [k: string]: unknown };

export interface AppDispatch {
  <R>(action: ThunkAction<R>): R;
  (action: { type: string; [k: string]: unknown }): void;
}

export const useAppDispatch = (): AppDispatch =>
  useDispatch() as unknown as AppDispatch;
