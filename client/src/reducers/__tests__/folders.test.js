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
  describe('APPLICATION_FOLDER_RENAME_OK', () => {
    test('Folder renamed no longer exists in current state, should return unchanged state', () => {
      // Given
      const stateFolders = {...INITIAL_STATE.folders};

      // When
      const updatedState = folders(stateFolders,
        {type: ActionTypes.APPLICATION_FOLDER_RENAME_OK, payload: {oldFolderId: 'notInList'}});

      // Then
      expect(updatedState).toStrictEqual(INITIAL_STATE.folders);
    });
    test('Folder renamed with children in root,' +
      'should remove folder from previous tree position and children from exploded tree',
    () => {
      // Given
      const stateFolders = {...INITIAL_STATE.folders};
      stateFolders.explodedItems.parent = {folderId: 'parent',
        children: [{folderId: 'child1'}, {folderId: 'child2'}]};
      stateFolders.explodedItems.child1 = stateFolders.explodedItems.parent.children[0];
      stateFolders.explodedItems.child2 = stateFolders.explodedItems.parent.children[1];
      stateFolders.explodedItems.parentToRemain = {folderId: 'parentToRemain',
        children: [{folderId: 'parentToRemainChild'}]};
      stateFolders.explodedItems.parentToRemainChild = stateFolders.explodedItems.parentToRemain.children[0];
      stateFolders.items = [stateFolders.explodedItems.parent, stateFolders.explodedItems.parentToRemain];

      // When
      const updatedState = folders(stateFolders,
        {type: ActionTypes.APPLICATION_FOLDER_RENAME_OK, payload: {oldFolderId: 'parent'}});

      // Then
      expect(updatedState.items.length).toEqual(1);
      expect(Object.keys(updatedState.explodedItems).length).toEqual(2);
      expect(updatedState.explodedItems).toMatchObject({
        parentToRemain: expect.anything(),
        parentToRemainChild: expect.anything()
      });
      expect(updatedState.items[0]).toMatchObject(stateFolders.explodedItems.parentToRemain);
    });
    test('Folder renamed with children in folder,' +
      'should remove folder from previous tree position and children from exploded tree',
    () => {
      // Given
      const stateFolders = {...INITIAL_STATE.folders};
      stateFolders.explodedItems.parent = {folderId: 'parent',
        children: [{folderId: 'child1'}, {folderId: 'child2', children: [{folderId: 'child2_1'}]}]};
      stateFolders.explodedItems.child1 = stateFolders.explodedItems.parent.children[0];
      stateFolders.explodedItems.child2 = stateFolders.explodedItems.parent.children[1];
      stateFolders.explodedItems.child2_1 = stateFolders.explodedItems.parent.children[1].children[0];
      stateFolders.explodedItems.parentToRemain = {folderId: 'parentToRemain',
        children: [parent, {folderId: 'parentToRemainChild'}]};
      stateFolders.explodedItems.parentToRemainChild = stateFolders.explodedItems.parentToRemain.children[0];
      stateFolders.items = [stateFolders.explodedItems.parentToRemain];

      // When
      const updatedState = folders(stateFolders,
        {type: ActionTypes.APPLICATION_FOLDER_RENAME_OK, payload: {oldFolderId: 'parent'}});

      // Then
      expect(updatedState.items.length).toEqual(1);
      expect(Object.keys(updatedState.explodedItems).length).toEqual(2);
      expect(updatedState.explodedItems).toMatchObject({
        parentToRemain: expect.anything(),
        parentToRemainChild: expect.anything()
      });
      expect(updatedState.items[0]).toMatchObject(stateFolders.explodedItems.parentToRemain);
    });
  });
});

