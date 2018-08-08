import {combineReducers} from 'redux';
import folders from './folders';
import messages from './messages';

export const initialState = {
  folders: [
    {name: 'Example folder'}
  ],
  messages: [
    {subject: 'This is a message sample'}
  ]
};

export default combineReducers({
  folders: folders,
  messages: messages
});
