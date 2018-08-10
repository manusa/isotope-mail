import {combineReducers} from 'redux';
import application from './application';
import folders from './folders';
import messages from './messages';

export const initialState = {
  application: {
    title: 'Isotope Mail Client'
  },
  folders: {
    items: [],
    activeRequests: 0
  },
  messages: [
    {subject: 'This is a message sample'}
  ]
};

// https://github.com/reduxjs/redux/issues/749#issuecomment-164327121
export default combineReducers({
  application,
  folders: folders,
  messages: messages
});
