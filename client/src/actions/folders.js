import {ActionTypes} from './action-types';

export const addFolder = folder => ({type: ActionTypes.ADD_FOLDER, payload: folder});
export const resetFolders = folders => ({type: ActionTypes.RESET_FOLDERS, payload: folders});
