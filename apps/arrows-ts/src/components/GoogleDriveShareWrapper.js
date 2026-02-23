/**
 * Share/copy link for Google Drive files using Drive API v3.
 * Replaces deprecated gapi.drive.share.ShareClient. Uses access token from Redux.
 * On 401, call on401() to clear token and set signedIn false.
 */
export default class GoogleDriveShareWrapper {
  constructor(storage, accessToken, on401) {
    this.storage = storage;
    this.accessToken = accessToken;
    this.on401 = on401;
  }

  openDialog() {
    if (!this.accessToken || !this.storage?.fileId) {
      return;
    }
    const url = `https://www.googleapis.com/drive/v3/files/${this.storage.fileId}?supportsAllDrives=true&fields=webViewLink`;
    fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + this.accessToken
      }
    })
      .then(res => {
        if (res.status === 401) {
          this.on401?.();
          return null;
        }
        return res.json();
      })
      .then(file => {
        if (!file?.webViewLink) return;
        // No in-app toast in this codebase; using alert for feedback. A follow-up could add a non-blocking toast.
        if (navigator.clipboard?.writeText) {
          navigator.clipboard.writeText(file.webViewLink).then(() => {
            alert('Link copied to clipboard.');
          }).catch(() => {
            this.fallbackCopy(file.webViewLink);
          });
        } else {
          this.fallbackCopy(file.webViewLink);
        }
      })
      .catch(err => console.error('Share/copy link error', err));
  }

  fallbackCopy(link) {
    const textArea = document.createElement('textarea');
    textArea.value = link;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      alert('Link copied to clipboard.');
    } catch (e) {
      alert('Link: ' + link);
    }
    document.body.removeChild(textArea);
  }
}
