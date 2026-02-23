const initialState = {
  apiInitialized: false,
  signedIn: false,
  accessToken: null,
  expiresAt: null
};

export default (state = initialState, action) => {
  switch (action.type) {
    case 'GOOGLE_DRIVE_API_INITIALIZED':
      return {
        ...state,
        apiInitialized: true
      };
    case 'GOOGLE_DRIVE_SIGN_IN_STATUS':
      return {
        ...state,
        apiInitialized: true,
        signedIn: action.signedIn
      };
    case 'SET_GOOGLE_DRIVE_TOKEN':
      return {
        ...state,
        accessToken: action.accessToken,
        expiresAt: action.expiresAt ?? null,
        signedIn: true
      };
    case 'CLEAR_GOOGLE_DRIVE_TOKEN':
      return {
        ...state,
        accessToken: null,
        expiresAt: null,
        signedIn: false
      };
    default:
      return state;
  }
};
