import folders from '../folders';
import {ActionTypes} from '../../actions/action-types';
import {INITIAL_STATE} from '../index';

describe('Folders reducer test suite', () => {
  test('Folders default state', () => {
    const foldersDefaultState = folders();
    expect(foldersDefaultState).toHaveProperty('items', []);
    expect(foldersDefaultState).toHaveProperty('explodedItems', {});
    expect(foldersDefaultState).toHaveProperty('activeRequests', 0);
  });
  test('Folders BE Request', () => {
    const updatedState = folders(INITIAL_STATE.folders, {type: ActionTypes.FOLDERS_BE_REQUEST});
    expect(updatedState.activeRequests).toBe(1);
  });
});

