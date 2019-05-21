import {INITIAL_STATE} from './';
import {ActionTypes} from '../actions/action-types';

const application = (state = INITIAL_STATE.application, action = {}) => {
  switch (action.type) {
    case ActionTypes.APPLICATION_BE_REQUEST:
      return {...state, activeRequests: state.activeRequests + 1};
    case ActionTypes.APPLICATION_BE_REQUEST_COMPLETED:
      return {...state, activeRequests: state.activeRequests > 0 ? state.activeRequests - 1 : 0};
    case ActionTypes.APPLICATION_USER_CREDENTIALS_CLEAR: {
      return {...state, user: {}};
    }
    case ActionTypes.APPLICATION_USER_CREDENTIALS_SET:
      return {
        ...state, user: {
          ...state.user,
          id: action.payload.userId, hash: action.payload.hash, credentials: action.payload.credentials
        }
      };
    case ActionTypes.APPLICATION_USER_CREDENTIALS_REFRESH: {
      const newState = {...state};
      newState.user = {...newState.user};
      newState.user.credentials = {...newState.user.credentials,
        encrypted: action.payload.encrypted, salt: action.payload.salt};
      return newState;
    }
    case ActionTypes.APPLICATION_FOLDER_SELECT:
      return {
        ...state,
        selectedFolderId: action.payload.folderId,
        messageFilterKey: null,
        messageFilterText: ''
      };
    case ActionTypes.APPLICATION_FOLDER_CREATE: {
      return {
        ...state,
        createFolderParentId: action.payload
      };
    }
    case ActionTypes.APPLICATION_FOLDER_RENAME: {
      return {
        ...state,
        renameFolderId: action.payload ? action.payload.folderId : null
      };
    }
    case ActionTypes.APPLICATION_FOLDER_RENAME_OK: {
      const newState = {...state};
      if (state.selectedFolderId === action.payload.oldFolderId) {
        newState.selectedFolderId = action.payload.newFolderId;
      }
      return newState;
    }
    case ActionTypes.APPLICATION_MESSAGE_FILTER_KEY_SET: {
      return {...state, messageFilterKey: action.payload};
    }
    case ActionTypes.APPLICATION_MESSAGE_FILTER_TEXT_SET: {
      return {...state, messageFilterText: action.payload};
    }
    case ActionTypes.APPLICATION_MESSAGE_SELECT:
      return {...state, selectedMessage: {...action.payload}};
    case ActionTypes.APPLICATION_MESSAGE_REFRESH: {
      const newState = {...state};
      const message = action.payload.message;
      newState.downloadedMessages = {...newState.downloadedMessages};
      // Store in application.downloadedMessages
      newState.downloadedMessages[message.messageId] = message;
      // Update selected message if is currently selected
      if (state.selectedFolderId === action.payload.folder.folderId
        && state.selectedMessage.uid === message.uid) {
        newState.selectedMessage = {...message};
      }
      return newState;
    }
    case ActionTypes.APPLICATION_MESSAGE_REFRESH_BE_REQUEST:
      return {...state, refreshMessageActiveRequests: state.refreshMessageActiveRequests + 1};
    case ActionTypes.APPLICATION_MESSAGE_REFRESH_BE_REQUEST_COMPLETED:
      return {...state, refreshMessageActiveRequests:
          state.refreshMessageActiveRequests > 0 ? state.refreshMessageActiveRequests - 1 : 0};
    case ActionTypes.APPLICATION_MESSAGE_PRE_DOWNLOAD: {
      const newState = {...state};
      const messages = action.payload.messages;
      // Store in application.downloadedMessages
      messages.forEach(message => {
        newState.downloadedMessages[message.messageId] = message;
      });
      return newState;
    }
    case ActionTypes.APPLICATION_MESSAGE_REPLACE_IMAGE: {
      const newState = {...state};
      const folder = action.payload.folder;
      const message = action.payload.message;
      const attachment = action.payload.attachment;
      const contentId = attachment.contentId.replace(/[<>]/g, '');
      const regex = new RegExp(`cid:${contentId}`, 'g'); // Multiple occurrence -> ReplaceAll
      if (contentId.length > 0) {
        const objectUrl = URL.createObjectURL(action.payload.blob);
        // Store in application.downloadedMessages
        newState.downloadedMessages[message.messageId].content =
          newState.downloadedMessages[message.messageId].content.replace(regex, objectUrl);
        // Update selected message if applicable
        if (newState.selectedFolderId === folder.folderId
          && newState.selectedMessage.uid === message.uid) {
          const parsedMessage = newState.selectedMessage.content.replace(regex, objectUrl);
          newState.selectedMessage = {...newState.selectedMessage, content: parsedMessage};
        }
      }
      return newState;
    }
    case ActionTypes.APPLICATION_ERROR_SET:
      const errorsSetState = {...state};
      errorsSetState.errors = {...state.errors};
      errorsSetState.errors[action.payload.type] = action.payload.value;
      return errorsSetState;
    case ActionTypes.APPLICATION_MESSAGE_EDIT: {
      const newState = {...state};
      newState.newMessage = action.payload ? {...action.payload} : null;
      return newState;
    }
    case ActionTypes.APPLICATION_MESSAGE_EDIT_SUBJECT: {
      const newState = {...state};
      newState.newMessage = {...newState.newMessage};
      newState.newMessage.subject = action.payload;
      return newState;
    }
    case ActionTypes.APPLICATION_OUTBOX_SEND: {
      const newState = {...state};
      newState.outbox = {message: action.payload, progress: 0, sent: false};
      return newState;
    }
    case ActionTypes.APPLICATION_OUTBOX_UPDATE_PROGRESS: {
      const newState = {...state};
      newState.outbox = {...newState.outbox, progress: action.payload};
      return newState;
    }
    case ActionTypes.APPLICATION_OUTBOX_SET_SENT: {
      const newState = {...state};
      newState.outbox = {...newState.outbox, sent: action.payload};
      return newState;
    }
    case ActionTypes.APPLICATION_OUTBOX_SET_ERROR: {
      const newState = {...state};
      newState.outbox = {...newState.outbox, error: action.payload};
      return newState;
    }
    case ActionTypes.APPLICATION_OUTBOX_MESSAGE_PROCESSED: {
      const newState = {...state};
      newState.outbox = null;
      return newState;
    }
    default:
      return state;
  }
};

export default application;
