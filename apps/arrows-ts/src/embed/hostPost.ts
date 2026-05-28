export type HostMessage = { type: string; [k: string]: unknown };
export type HostPost = (m: HostMessage) => void;

export const postToHost: HostPost = (msg) => {
  const w = window as unknown as { __arrowsHostPost?: HostPost };
  try {
    if (w.__arrowsHostPost) w.__arrowsHostPost(msg);
    else window.parent.postMessage(msg, '*');
  } catch {
    /* host channel unavailable */
  }
};
