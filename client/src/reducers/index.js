import {combineReducers} from 'redux';
import folders from './folders';
import messages from './messages';

export const initialState = {
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
  folders: folders,
  messages: messages
});
