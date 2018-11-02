import {ActionTypes} from './action-types';
import {processFolders} from '../services/folder';

export const backendRequest = () => ({type: ActionTypes.FOLDERS_BE_REQUEST});
export const setFolders = folders => ({
  type: ActionTypes.FOLDERS_SET, payload: processFolders(folders)
});
export const updateFolder = folder => {
  folder = processFolders([folder])[0];
  return ({type: ActionTypes.FOLDERS_UPDATE, payload: folder});
};
