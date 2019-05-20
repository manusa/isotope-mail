import {combineReducers} from 'redux';
import application from './application';
import folders from './folders';
import login from './login';
import messages from './messages';

export const INITIAL_STATE = {
  application: {
    title: 'Isotope Mail Client',
    user: {},
    newMessage: null,
    selectedFolderId: {},
    messageFilterKey: null,
    messageFilterText: '',
    createFolderParentId: null,
    renameFolderId: null,
    selectedMessage: null,
    downloadedMessages: {},
    outbox: null,
    pollInterval: 15000,
    errors: {
      diskQuotaExceeded: false,
      authentication: null
    },
    refreshMessageActiveRequests: 0,
    activeRequests: 0
  },
  folders: {
    items: [],
    explodedItems: {},
    activeRequests: 0
  },
  login: {
    formValues: {}
  },
  messages: {
    cache: {},
    selected: [],
    locked: [],
    activeRequests: 0
  }
};

// https://github.com/reduxjs/redux/issues/749#issuecomment-164327121
export default combineReducers({
  application,
  login,
  folders: folders,
  messages: messages
});
