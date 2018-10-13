import {combineReducers} from 'redux';
import application from './application';
import folders from './folders';
import messages from './messages';

export const INITIAL_STATE = {
  application: {
    title: 'Isotope Mail Client',
    user: {},
    newMessage: null,
    selectedFolderId: {},
    selectedMessage: null,
    pollInterval: 15000,
    errors: {
      diskQuotaExceeded: false
    },
    activeRequests: 0
  },
  folders: {
    items: [],
    explodedItems: {},
    activeRequests: 0
  },
  messages: {
    cache: {},
    selected: [],
    activeRequests: 0
  }
};

// https://github.com/reduxjs/redux/issues/749#issuecomment-164327121
export default combineReducers({
  application,
  folders: folders,
  messages: messages
});
