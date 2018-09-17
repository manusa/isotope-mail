import {ActionTypes} from './action-types';

export const backendRequest = () => ({type: ActionTypes.FOLDERS_BE_REQUEST});
export const setFolders = folders => ({type: ActionTypes.FOLDERS_SET, payload: folders});
export const updateFolder = folder => ({type: ActionTypes.FOLDERS_UPDATE, payload: folder});
export const addFolder = folder => ({type: ActionTypes.FOLDERS_ADD, payload: folder});
