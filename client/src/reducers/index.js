import {combineReducers} from 'redux';
import folders from './folders';

export const initialState = {
  folders: [
    {name: 'First'},
    {name: 'Second'}
  ],
  messages: [
    {subject: 'This is a message'},
    {subject: 'This is another message'}
  ]
};

export default combineReducers({
  folders: folders
});
