import {getSelectedFolder} from '../folders';


describe('folders selectors test suite', () => {
  describe('getSelectedFolder', () => {
    test('application.selectedFolderId null and empty folders.explodedFolders, should return undefined', () => {
      // Given
      const state = {
        application: {selectedFolderId: null},
        folders: {explodedItems: {}}
      };
      // When
      const result = getSelectedFolder(state);
      // Then
      expect(result).toBeUndefined();
    });
    test('application.selectedFolderId NOT in folders.explodedFolders, should return undefined', () => {
      // Given
      const state = {
        application: {selectedFolderId: '1337/3313373'},
        folders: {explodedItems: {}}
      };
      // When
      const result = getSelectedFolder(state);
      // Then
      expect(result).toBeUndefined();
    });
    test('application.selectedFolderId in folders.explodedFolders, should return folder', () => {
      // Given
      const state = {
        application: {selectedFolderId: '1337/1337'},
        folders: {explodedItems: {
          '1337/3313373': {folderId: '3313373'},
          '1337/1337': {folderId: '1337'}
        }}
      };
      // When
      const result = getSelectedFolder(state);
      // Then
      expect(result).toEqual({folderId: '1337'});
    });
  });
});
