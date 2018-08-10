import {ActionTypes} from './action-types';

export const backendRequest = () => ({type: ActionTypes.FOLDERS_BE_REQUEST});
export const addFolder = folder => ({type: ActionTypes.FOLDERS_ADD, payload: folder});
export const resetFolders = folders => ({type: ActionTypes.FOLDERS_RESET, payload: folders});
