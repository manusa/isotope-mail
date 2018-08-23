import {combineReducers} from 'redux';
import application from './application';
import folders from './folders';
import messages from './messages';

export const INITIAL_STATE = {
  application: {
    title: 'Isotope Mail Client',
    user: {},
    selectedFolder: {},
    activeRequests: 0
  },
  folders: {
    selected: {},
    items: [],
    activeRequests: 0
  },
  messages: {
    cache: {},
    activeRequests: 0
  }
};

// https://github.com/reduxjs/redux/issues/749#issuecomment-164327121
export default combineReducers({
  application,
  folders: folders,
  messages: messages
});
