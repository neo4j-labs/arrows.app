import {generateLocalFileId} from "../storage/localFileId";

export default function storage(state = {
  mode: 'LOCAL_STORAGE',
  status: 'GET',
  fileId: null,
  googleDrive: {}
}, action) {
  switch (action.type) {
    case 'NEW_GOOGLE_DRIVE_DIAGRAM': {
      return {
        ...state,
        mode: 'GOOGLE_DRIVE',
        status: 'POST',
        fileId: null,
      }
    }
    case 'NEW_LOCAL_STORAGE_DIAGRAM': {
      return {
        ...state,
        mode: 'LOCAL_STORAGE',
        status: 'POST',
        fileId: generateLocalFileId()
      }
    }
    case 'PICK_DIAGRAM': {
      switch (action.mode) {
        case 'GOOGLE_DRIVE':
          return {
            ...state,
            status: 'PICKING_FROM_GOOGLE_DRIVE',
          }
        case 'LOCAL_STORAGE':
          return {
            ...state,
            status: 'PICKING_FROM_LOCAL_STORAGE',
          }
        default:
          return state
      }
    }
    case 'PICK_DIAGRAM_CANCEL': {
      return {
        ...state,
        status: 'READY',
      }
    }
    case 'GET_FILE_FROM_GOOGLE_DRIVE': {
      return {
        ...state,
        mode: 'GOOGLE_DRIVE',
        status: 'GET',
        fileId: action.fileId,
      }
    }
    case 'GET_FILE_FROM_LOCAL_STORAGE': {
      return {
        ...state,
        mode: 'LOCAL_STORAGE',
        status: 'GET',
        fileId: action.fileId
      }
    }
    case 'GETTING_GRAPH': {
      return {
        ...state,
        status: 'GETTING'
      }
    }
    case 'POST_CURRENT_DIAGRAM_AS_NEW_FILE_ON_GOOGLE_DRIVE': {
      return {
        ...state,
        mode: 'GOOGLE_DRIVE',
        status: 'POST',
        fileId: null,
      }
    }
    case 'GETTING_GRAPH_SUCCEEDED': {
      return {
        ...state,
        status: 'READY'
      }
    }
    case 'POSTED_FILE_ON_GOOGLE_DRIVE':
      return {
        ...state,
        status: 'READY',
        fileId: action.fileId,
      }
    case 'POSTED_FILE_TO_LOCAL_STORAGE':
      return {
        ...state,
        status: 'READY',
      }
    case 'GOOGLE_DRIVE_SIGN_IN_STATUS':
      return {
        ...state,
        googleDrive: {
          ...state.googleDrive,
          apiInitialized: true,
          signedIn: action.signedIn
        }
      }
    case 'PUT_GRAPH':
      return {
        ...state,
        status: 'PUT'
      }
    case 'PUTTING_GRAPH':
      return {
        ...state,
        status: 'PUTTING'
      }
    case 'PUTTING_GRAPH_SUCCEEDED':
      return {
        ...state,
        status: 'READY'
      }
    case 'PUTTING_GRAPH_FAILED':
      return {
        ...state,
        status: 'FAILED'
      }

    default:
      return state
  }
}
