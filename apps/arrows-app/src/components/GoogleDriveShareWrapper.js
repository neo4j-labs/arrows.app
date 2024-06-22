import config from '../config';
import { DISCOVERY_DOCS, SCOPES } from '../actions/googleDrive';

export default class {
  constructor(storage) {
    this.createShareClient(storage);
  }

  openDialog() {
    this.shareClient.showSettingsDialog();
  }

  createShareClient(storage) {
    const setupShareClient = (accessToken) => {
      const shareClient = new window.gapi.drive.share.ShareClient();
      shareClient.setOAuthToken(accessToken);
      shareClient.setItemIds([storage.fileId]);
      this.shareClient = shareClient;
    };

    if (
      window.gapi.auth2.getAuthInstance() &&
      window.gapi.auth2.getAuthInstance().isSignedIn.get()
    ) {
      setupShareClient(window.gapi.auth.getToken().access_token);
    } else {
      window.gapi.client
        .init({
          apiKey: config.apiKey,
          clientId: config.clientId,
          discoveryDocs: DISCOVERY_DOCS,
          scope: SCOPES,
        })
        .then(() => {
          if (!window.gapi.auth2.getAuthInstance().isSignedIn.get()) {
            window.gapi.auth2.getAuthInstance().signIn();
          }
          setupShareClient(window.gapi.auth.getToken().access_token);
        });
    }
  }
}
