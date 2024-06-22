export default (state = {}, action) => {
  switch (action.type) {
    case 'GOOGLE_DRIVE_SIGN_IN_STATUS':
      return {
        apiInitialized: true,
        signedIn: action.signedIn,
      };
    default:
      return state;
  }
};
