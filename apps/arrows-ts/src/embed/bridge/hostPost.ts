export type HostMessage = { type: string; [k: string]: unknown };
export type HostPost = (m: HostMessage) => void;

export interface EmbedWindow extends Window {
  __arrowsHostPost?: HostPost;
  __arrowsMenu?: unknown[];
}

export const embedWindow = (): EmbedWindow => window as EmbedWindow;

export const postToHost: HostPost = (msg) => {
  const w = embedWindow();
  try {
    if (w.__arrowsHostPost) w.__arrowsHostPost(msg);
    else window.parent.postMessage(msg, '*');
  } catch {
    /* host channel unavailable */
  }
};
