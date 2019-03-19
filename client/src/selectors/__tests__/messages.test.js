import {getSelectedFolderMessageList} from '../messages';

describe('messages selectors test suite', () => {
  describe('getSelectedFolderMessageList', () => {
    test('state.application null, should return empty array', () => {
      // Given
      const state = {};
      // When
      const result = getSelectedFolderMessageList(state);
      // Then
      expect(result).toEqual([]);
    });
    test('state.application.selectedFolderId null, should return empty array', () => {
      // Given
      const state = {application: {}};
      // When
      const result = getSelectedFolderMessageList(state);
      // Then
      expect(result).toEqual([]);
    });
    test('state.messages null, should return empty array', () => {
      // Given
      const state = {application: {selectedFolderId: '1337'}};
      // When
      const result = getSelectedFolderMessageList(state);
      // Then
      expect(result).toEqual([]);
    });
    test('state.messages.cache not containing selectedFolderId , should return empty array', () => {
      // Given
      const state = {application: {selectedFolderId: '1337'}, messages: {cache: {313373: {}}}};
      // When
      const result = getSelectedFolderMessageList(state);
      // Then
      expect(result).toEqual([]);
    });
    test('state.messages.cache containing selectedFolderId, should return sorted array', () => {
      // Given
      const messageArray = [
        {uid: 1, receivedDate: new Date(2001, 1), subject: 'First Message'},
        {uid: 2, receivedDate: new Date(1999, 1), subject: 'Second Message'},
        {uid: 3, receivedDate: new Date(2002, 1), subject: 'Third Message'},
        {uid: 4, receivedDate: new Date(2002, 1), subject: 'Fourth Message'}
      ];
      const state = {
        application: {selectedFolderId: '1337', messageFilterKey: null},
        messages: {cache: {1337: new Map(messageArray.map(m => [m.uid, m]))}}
      };
      // When
      const result = getSelectedFolderMessageList(state);
      // Then
      expect(result).toHaveLength(4);
      expect(result).toEqual([messageArray[2], messageArray[3], messageArray[0], messageArray[1]]);
    });
  });
});
