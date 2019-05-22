import folders from '../folders';
import {ActionTypes} from '../../actions/action-types';
import {INITIAL_STATE} from '../index';
import {FolderTypes} from '../../services/folder';

describe('Folders reducer test suite', () => {
  test('Folders default state', () => {
    const foldersDefaultState = folders();
    expect(foldersDefaultState).toHaveProperty('items', []);
    expect(foldersDefaultState).toHaveProperty('explodedItems', {});
    expect(foldersDefaultState).toHaveProperty('activeRequests', 0);
  });
  test('FOLDERS_BE_REQUEST', () => {
    const updatedState = folders(INITIAL_STATE.folders, {type: ActionTypes.FOLDERS_BE_REQUEST});
    expect(updatedState.activeRequests).toBe(1);
  });
  describe('FOLDERS_SET', () => {
    test('Initial state contains no folders, set folder with children, should set new folders', () => {
      // Given
      const initialState = {...INITIAL_STATE.folders, activeRequests: 1};
      const payload = [{folderId: '1337', messageCount: 1, children: [{folderId: '313373', children: []}]}];

      // When
      const updatedState = folders(initialState,
        {type: ActionTypes.FOLDERS_SET, payload});

      // Then
      expect(initialState.items).toHaveLength(0);
      expect(updatedState.activeRequests).toBe(0);
      expect(updatedState.items).toHaveLength(1);
      expect(Object.keys(updatedState.items[0])).toEqual(['folderId', 'children']); // Items only contain folderId and children fields
      expect(updatedState.items).toEqual(expect.arrayContaining([expect.objectContaining({folderId: '1337'})]));
      expect(Object.keys(updatedState.explodedItems)).toHaveLength(2);
      expect(Object.keys(updatedState.explodedItems)).toEqual(['1337', '313373']);
      expect(updatedState.explodedItems['1337']).toEqual(expect.objectContaining({messageCount: 1}));
    });
    test('Initial state contains folders, set folder with children, should set new folders', () => {
      // Given
      const initialState = {...INITIAL_STATE.folders, items: [{folderId: 'L337'}], activeRequests: 2};
      const payload = [{folderId: '1337', children: [{folderId: '313373', children: []}]}];

      // When
      const updatedState = folders(initialState,
        {type: ActionTypes.FOLDERS_SET, payload});

      // Then
      expect(initialState.items).toHaveLength(1);
      expect(initialState.items)
        .toEqual(expect.arrayContaining([expect.objectContaining({folderId: 'L337'})]));
      expect(updatedState.activeRequests).toBe(1);
      expect(updatedState.items).toHaveLength(1);
      expect(updatedState.items)
        .toEqual(expect.arrayContaining([expect.objectContaining({folderId: '1337'})]));
      expect(Object.keys(updatedState.explodedItems)).toHaveLength(2);
      expect(Object.keys(updatedState.explodedItems)).toEqual(['1337', '313373']);
    });
  });
  describe('FOLDERS_UPDATE', () => {
    test('Initial state containing folder, existing folder with updated folder, should replace folder', () => {
      // Given
      const initialState = {...INITIAL_STATE.folders,
        items: [{folderId: '1337', children: [{folderId: '313373', newMessageCount: 2, children: []}]}],
        explodedItems: {
          1337: {folderId: '1337', children: []},
          313373: {folderId: '313373', newMessageCount: 2, children: []}
        }
      };
      const payload = {
        folderId: '313373', newMessageCount: 1, children: []
      };

      // When
      const updatedState = folders(initialState, {type: ActionTypes.FOLDERS_UPDATE, payload});

      // Then
      expect(updatedState.items).toHaveLength(1);
      expect(updatedState.items[0].children[0]).toEqual({folderId: '313373', children: []});
      expect(Object.keys(updatedState.explodedItems)).toHaveLength(2);
      expect(updatedState.explodedItems['313373']).toEqual({folderId: '313373', newMessageCount: 1, children: []});
    });
    test('Initial state containing folder marked as TRASH, payload with existing folder, should replace folder', () => {
      // Given
      const items = [{folderId: '1337',
        children: [{folderId: '313373', type: FolderTypes.TRASH, newMessageCount: 2, children: []}]}];
      const initialState = {...INITIAL_STATE.folders,
        items,
        explodedItems: {
          1337: items[0],
          313373: items[0].children[0]
        }
      };
      const payload = {
        folderId: '313373', newMessageCount: 1, attributes: [], children: []
      };

      // When
      const updatedState = folders(initialState, {type: ActionTypes.FOLDERS_UPDATE, payload});

      // Then
      expect(updatedState.items).toHaveLength(1);
      expect(updatedState.items[0].children).toEqual([{folderId: '313373', children: []}]);
      expect(Object.keys(updatedState.explodedItems)).toHaveLength(2);
      expect(updatedState.explodedItems['313373']).toEqual(expect.objectContaining(
        {folderId: '313373', newMessageCount: 1, attributes: expect.arrayContaining([FolderTypes.TRASH.attribute])}));
    });
    test('Initial state containing NO folders, payload with folder, state should not change', () => {
      // Given
      const initialState = {...INITIAL_STATE.folders,
        items: [],
        explodedItems: {}
      };
      const payload = {
        folderId: '313373', newMessageCount: 1
      };

      // When
      const updatedState = folders(initialState, {type: ActionTypes.FOLDERS_UPDATE, payload});

      // Then
      expect(initialState.items).not.toBe(updatedState.items);
      expect(updatedState.items).toHaveLength(0);
      expect(Object.keys(updatedState.explodedItems)).toHaveLength(0);
    });
  });
  describe('FOLDERS_UPDATE_PROPERTIES', () => {
    test('Initial state containing folder, existing folder with updated folder, should replace folder properties but not children', () => {
      // Given
      const initialState = {...INITIAL_STATE.folders,
        items: [{folderId: '1337', newMessageCount: 15, children: [{folderId: '313373', newMessageCount: 2, children: []}]}],
        explodedItems: {
          1337: {folderId: '1337', newMessageCount: 15, children: []},
          313373: {folderId: '313373', newMessageCount: 2, children: []}
        }
      };
      const payload = {
        folderId: '1337', newMessageCount: 16, children: []
      };

      // When
      const updatedState = folders(initialState, {type: ActionTypes.FOLDERS_UPDATE_PROPERTIES, payload});

      // Then
      expect(updatedState.items).toHaveLength(1);
      expect(updatedState.items[0].children[0]).toEqual({folderId: '313373', newMessageCount: 2, children: []});
      expect(Object.keys(updatedState.explodedItems)).toHaveLength(2);
      expect(updatedState.explodedItems['1337']).toEqual({folderId: '1337', newMessageCount: 16, children: []});
    });
    test('Initial state containing NO folders, payload with folder, state should not change', () => {
      // Given
      const initialState = {...INITIAL_STATE.folders,
        items: [],
        explodedItems: {}
      };
      const payload = {
        folderId: '313373', newMessageCount: 1
      };

      // When
      const updatedState = folders(initialState, {type: ActionTypes.FOLDERS_UPDATE_PROPERTIES, payload});

      // Then
      expect(updatedState.items).toHaveLength(0);
      expect(Object.keys(updatedState.explodedItems)).toHaveLength(0);
    });
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

