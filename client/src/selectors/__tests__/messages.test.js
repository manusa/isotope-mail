import {cache, selectedMessagesIds, selectedFolderMessageList, selectedFolderMessagesFiltered} from '../messages';

describe('messages selectors test suite', () => {
  let messageArray;
  beforeEach(() => {
    messageArray = [
      {
        uid: 1, receivedDate: new Date(2001, 1),
        flagged: false, subject: 'First Message',
        from: ['"Alex from Isotope" <alex@isotope.com>'],
        recipients: [
          {type: 'To', address: '"Mr. Isotope" <mr@isotope.com>'}
        ]
      },
      {
        uid: 2, receivedDate: new Date(1999, 1),
        flagged: false, subject: 'Second Message',
        from: [],
        recipients: [
          {type: 'To', address: '"Mr. Isotope" <mr@isotope.com>'}
        ]
      },
      {
        uid: 3, receivedDate: new Date(2002, 1),
        flagged: true, seen: true, subject: 'Third Message',
        from: [],
        recipients: [
          {type: 'To', address: '"Mr. Isotope" <mr@isotope.com>'},
          {type: 'Cc', address: '"Mr. Isotope\'s butler" <butler@isotope.com>'}
        ]
      },
      {
        uid: 4, receivedDate: new Date(2002, 1),
        flagged: false, seen: true, subject: 'Fourth Message èSpÊCíÄllY',
        from: [],
        recipients: [
          {type: 'To', address: '"Mr. Isotope" <mr@isotope.com>'}
        ]
      }
    ];
  });
  test('cache', () => {
    // Given
    const state = {messages: {cache: {1337: {}}}};
    // When
    const result = cache(state);
    // Then
    expect(result).toEqual({1337: {}});
  });
  test('selectedMessagesIds', () => {
    // Given
    const state = {messages: {selected: [1337, 31337]}};
    // When
    const result = selectedMessagesIds(state);
    // Then
    expect(result).toEqual([1337, 31337]);
  });
  describe('selectedFolderMessageList ', () => {
    test('state.application null, should return empty array', () => {
      // Given
      const state = {};
      // When
      const result = selectedFolderMessageList(state);
      // Then
      expect(result).toBeUndefined();
    });
    test('state.application.selectedFolderId null, should return empty array', () => {
      // Given
      const state = {application: {}};
      // When
      const result = selectedFolderMessageList(state);
      // Then
      expect(result).toBeUndefined();
    });
    test('state.messages null, should return empty array', () => {
      // Given
      const state = {application: {selectedFolderId: '1337'}};
      // When
      const result = selectedFolderMessageList(state);
      // Then
      expect(result).toBeUndefined();
    });
    test('state.messages.cache not containing selectedFolderId , should return undefined', () => {
      // Given
      const state = {application: {selectedFolderId: '1337'}, messages: {cache: {313373: {}}}};
      // When
      const result = selectedFolderMessageList(state);
      // Then
      expect(result).toBeUndefined();
    });
    test('state.messages.cache containing selectedFolderId, should return array', () => {
      // Given
      const state = {
        application: {selectedFolderId: '1337', messageFilterKey: null},
        messages: {cache: {
          1337: new Map(messageArray.map(m => [m.uid, m])),
          31337: new Map([{uid: 5}].map(m => [m.uid, m]))
        }}
      };
      // When
      const result = selectedFolderMessageList(state);
      // Then
      expect(result.size).toBe(4);
      expect(Array.from(result.values())).toEqual(messageArray);
    });
  });
  describe('selectedFolderMessagesFiltered', () => {
    test('state.messages.cache not containing selectedFolderId , should return empty array', () => {
      // Given
      const state = {application: {selectedFolderId: '1337'}, messages: {cache: {313373: {}}}};
      // When
      const result = selectedFolderMessagesFiltered(state);
      // Then
      expect(result).toEqual([]);
    });
    test('state.messages.cache containing selectedFolderId, should return sorted array', () => {
      // Given
      const state = {
        application: {selectedFolderId: '1337', messageFilterKey: null},
        messages: {cache: {1337: new Map(messageArray.map(m => [m.uid, m]))}}
      };
      // When
      const result = selectedFolderMessagesFiltered(state);
      // Then
      expect(result).toHaveLength(4);
      expect(result).toEqual([messageArray[2], messageArray[3], messageArray[0], messageArray[1]]);
    });
    test('state.messages.cache containing selectedFolderId and messageFilterKey=FLAGGED, should return sorted array of matched messages', () => {
      // Given
      const state = {
        application: {selectedFolderId: '1337', messageFilterKey: 'FLAGGED'},
        messages: {cache: {1337: new Map(messageArray.map(m => [m.uid, m]))}}
      };
      // When
      const result = selectedFolderMessagesFiltered(state);
      // Then
      expect(result).toHaveLength(1);
      expect(result).toEqual([messageArray[2]]);
    });
    test('state.messages.cache containing selectedFolderId and messageFilterKey=SEEN and messageFilterText NOT matching anything,' +
      'should return sorted array of matched messages', () => {
      // Given
      const state = {
        application: {selectedFolderId: '1337', messageFilterKey: 'SEEN', messageFilterText: 'RèAll`` y'},
        messages: {cache: {1337: new Map(messageArray.map(m => [m.uid, m]))}}
      };
      // When
      const result = selectedFolderMessagesFiltered(state);
      // Then
      expect(result).toEqual([]);
    });
    test('state.messages.cache containing selectedFolderId and messageFilterKey=SEEN and messageFilterText matching subject,' +
      'should return sorted array of matched messages', () => {
      // Given
      const state = {
        application: {selectedFolderId: '1337', messageFilterKey: 'SEEN', messageFilterText: 'ÉsPècïaLLy'},
        messages: {cache: {1337: new Map(messageArray.map(m => [m.uid, m]))}}
      };
      // When
      const result = selectedFolderMessagesFiltered(state);
      // Then
      expect(result).toHaveLength(1);
      expect(result).toEqual([messageArray[3]]);
    });
    test('state.messages.cache containing selectedFolderId and messageFilterKey=ALL and messageFilterText matching from,' +
      'should return sorted array of matched messages', () => {
      // Given
      const state = {
        application: {selectedFolderId: '1337', messageFilterKey: 'ALL', messageFilterText: 'Alex'},
        messages: {cache: {1337: new Map(messageArray.map(m => [m.uid, m]))}}
      };
      // When
      const result = selectedFolderMessagesFiltered(state);
      // Then
      expect(result).toHaveLength(1);
      expect(result).toEqual([messageArray[0]]);
    });
    test('state.messages.cache containing selectedFolderId and messageFilterKey=ALL and messageFilterText matching recipient,' +
      'should return sorted array of matched messages', () => {
      // Given
      const state = {
        application: {selectedFolderId: '1337', messageFilterKey: 'ALL', messageFilterText: 'BúTler'},
        messages: {cache: {1337: new Map(messageArray.map(m => [m.uid, m]))}}
      };
      // When
      const result = selectedFolderMessagesFiltered(state);
      // Then
      expect(result).toHaveLength(1);
      expect(result).toEqual([messageArray[2]]);
    });
  });
});
