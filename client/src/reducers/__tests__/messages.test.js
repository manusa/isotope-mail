import {ActionTypes} from '../../actions/action-types';
import messages from '../messages';
import {INITIAL_STATE} from '../index';
import {deleteFromCache} from '../../actions/messages';

describe('Messages reducer test suite', () => {
  test('Messages default state', () => {
    const messagesDefaultState = messages();
    expect(messagesDefaultState).toHaveProperty('cache', {});
    expect(messagesDefaultState).toHaveProperty('selected', []);
    expect(messagesDefaultState).toHaveProperty('activeRequests', 0);
  });
  test('MESSAGES_BE_REQUEST', () => {
    const updatedState = messages(INITIAL_STATE.messages, {type: ActionTypes.MESSAGES_BE_REQUEST});
    expect(updatedState.activeRequests).toBe(1);
  });
  describe('MESSAGES_BE_REQUEST_COMPLETED', () => {
    test('Initial state was 0, should stay 0', () => {
      const updatedState = messages(INITIAL_STATE.messages, {type: ActionTypes.MESSAGES_BE_REQUEST_COMPLETED});
      expect(updatedState.activeRequests).toBe(0);
    });
    test('Initial state was 2, should change to 1', () => {
      const updatedState = messages({...INITIAL_STATE.messages, activeRequests: 2},
        {type: ActionTypes.MESSAGES_BE_REQUEST_COMPLETED});
      expect(updatedState.activeRequests).toBe(1);
    });
  });
  test('Messages set cache (original cache)', () => {
    const replacedCachePayload = {otherFolder: {}};

    const updatedState = messages({...INITIAL_STATE.messages, cache: {existingFolder: {}}},
      {type: ActionTypes.MESSAGES_SET_CACHE, payload: replacedCachePayload});

    expect(updatedState.cache).not.toHaveProperty('existingFolder');
    expect(updatedState.cache).toHaveProperty('otherFolder', {});
  });
  describe('MESSAGES_SET_FOLDER_CACHE', () => {
    test('Non-existent folder, should add entry to cache', () => {
      // Given
      const initialState = {...INITIAL_STATE.messages};

      // When
      const updatedState = messages(initialState, {
        type: ActionTypes.MESSAGES_SET_FOLDER_CACHE,
        payload: {
          folder: {folderId: '1337'},
          messages: [{uid: 1}, {uid: 3}, {uid: 7}]
        }
      });

      // Then
      expect(initialState).not.toMatchObject(updatedState);
      expect(updatedState.cache['1337'].size).toEqual(3);
      expect(Array.from(updatedState.cache['1337'].keys())).toEqual(expect.arrayContaining([1, 3, 7]));
    });
    test('Existent folder, should replace entry in cache', () => {
      // Given
      const initialState = {...INITIAL_STATE.messages};
      initialState.cache['1337'] = new Map([{uid: 1}, {uid: 3}].map(m => [m.uid, m]));
      initialState.cache['31337'] = new Map();

      // When
      const updatedState = messages(initialState, {
        type: ActionTypes.MESSAGES_SET_FOLDER_CACHE,
        payload: {
          folder: {folderId: '1337'},
          messages: [{uid: 1}, {uid: 3}, {uid: 7}]
        }
      });

      // Then
      expect(initialState).not.toMatchObject(updatedState);
      expect(initialState.cache['1337']).not.toEqual(updatedState.cache['1337']);
      expect(updatedState.cache['1337'].size).toEqual(3);
      expect(Array.from(updatedState.cache['1337'].keys())).toEqual(expect.arrayContaining([1, 3, 7]));
    });
  });
  describe('MESSAGES_UPDATE_CACHE', () => {
    test('Existent folder and existent message, should update message entry in cache', () => {
      // Given
      const initialState = {...INITIAL_STATE.messages};
      initialState.cache = {...initialState.cache};
      initialState.cache['1337'] = new Map([{uid: 1, property: 'initial value'}, {uid: 3}].map(m => [m.uid, m]));

      // When
      const updatedState = messages(initialState, {
        type: ActionTypes.MESSAGES_UPDATE_CACHE,
        payload: {
          folder: {folderId: '1337'},
          messages: [{uid: 1, property: 'updated value'}]
        }
      });

      // Then
      expect(initialState).not.toMatchObject(updatedState);
      expect(updatedState.cache['1337'].size).toEqual(2);
      expect(Array.from(updatedState.cache['1337'].keys())).toEqual(expect.arrayContaining([1, 3]));
      expect(updatedState.cache['1337'].get(1).property).toEqual('updated value');
    });
    test('Existent folder and existent messages with one lock, should only update unlocked message entry in cache', () => {
      // Given
      const initialState = {...INITIAL_STATE.messages};
      initialState.cache = {...initialState.cache};
      initialState.cache['1337'] = new Map(
        [
          {uid: 1, messageId: '<blockedMessage@server.com>', property: 'initial value'},
          {uid: 2, messageId: '<notBlocked1@server.com>', property: 'initial value'},
          {uid: 3, messageId: '<notBlocked2@server.com>', property: 'initial value'}
        ]
          .map(m => [m.uid, m]));
      initialState.locked = ['<blockedMessage@server.com>'];

      // When
      const updatedState = messages(initialState, {
        type: ActionTypes.MESSAGES_UPDATE_CACHE,
        payload: {
          folder: {folderId: '1337'},
          messages: [
            {uid: 1, messageId: '<blockedMessage@server.com>', property: 'updated value'},
            {uid: 3, messageId: '<notBlocked2@server.com>', property: 'updated value'}]
        }
      });

      // Then
      expect(initialState).not.toMatchObject(updatedState);
      expect(updatedState.cache['1337'].size).toEqual(3);
      expect(Array.from(updatedState.cache['1337'].keys())).toEqual(expect.arrayContaining([1, 2, 3]));
      expect(updatedState.cache['1337'].get(1).property).toEqual('initial value');
      expect(updatedState.cache['1337'].get(2).property).toEqual('initial value');
      expect(updatedState.cache['1337'].get(3).property).toEqual('updated value');
    });
    test('Existent folder and non-existent message, should add message entry in folder cache', () => {
      // Given
      const initialState = {...INITIAL_STATE.messages};
      initialState.cache = {...initialState.cache};
      initialState.cache['1337'] = new Map([{uid: 3}].map(m => [m.uid, m]));

      // When
      const updatedState = messages(initialState, {
        type: ActionTypes.MESSAGES_UPDATE_CACHE,
        payload: {
          folder: {folderId: '1337'},
          messages: [{uid: 1, property: 'new value'}]
        }
      });

      // Then
      expect(initialState).not.toMatchObject(updatedState);
      expect(updatedState.cache['1337'].size).toEqual(2);
      expect(Array.from(updatedState.cache['1337'].keys())).toEqual(expect.arrayContaining([1, 3]));
      expect(updatedState.cache['1337'].get(1).property).toEqual('new value');
    });
    test('Non-existent folder, should add folder and message entry in cache', () => {
      // Given
      const initialState = {...INITIAL_STATE.messages};
      initialState.cache = {...initialState.cache};
      delete initialState.cache['1337'];

      // When
      const updatedState = messages(initialState, {
        type: ActionTypes.MESSAGES_UPDATE_CACHE,
        payload: {
          folder: {folderId: '1337'},
          messages: [{uid: 1, property: 'new value'}]
        }
      });

      // Then
      expect(initialState).not.toMatchObject(updatedState);
      expect(updatedState.cache['1337'].size).toEqual(1);
      expect(Array.from(updatedState.cache['1337'].keys())).toEqual(expect.arrayContaining([1]));
      expect(updatedState.cache['1337'].get(1).property).toEqual('new value');
    });
  });
  describe('MESSAGES_UPDATE_CACHE_IF_EXIST', () => {
    test('Non-existent folder, should return same state', () => {
      // Given
      const initialState = {...INITIAL_STATE.messages};
      initialState.cache = {...initialState.cache};
      initialState.cache['1337'] = new Map();
      Array(10).fill('').map((v, i) => i).forEach(i => initialState.cache['1337'].set(i, {uid: i}));

      // When
      const updatedState = messages(initialState, {
        type: ActionTypes.MESSAGES_UPDATE_CACHE_IF_EXIST,
        payload: {
          folder: {folderId: '313373'},
          messages: [{uid: 1, property: 'updated value'}]
        }
      });

      // Then
      expect(updatedState.cache['1337'].size).toEqual(10);
      expect(updatedState).toMatchObject(initialState);
    });
    test('Existent folder with messages, should update message entry in cache', () => {
      // Given
      const initialState = {...INITIAL_STATE.messages};
      initialState.cache = {...initialState.cache};
      initialState.cache['1337'] = new Map([{uid: 1, property: 'initial value'}, {uid: 3}].map(m => [m.uid, m]));

      // When
      const updatedState = messages(initialState, {
        type: ActionTypes.MESSAGES_UPDATE_CACHE_IF_EXIST,
        payload: {
          folder: {folderId: '1337'},
          messages: [{uid: 1, property: 'updated value'}]
        }
      });

      // Then
      expect(initialState).not.toMatchObject(updatedState);
      expect(updatedState.cache['1337'].size).toEqual(2);
      expect(Array.from(updatedState.cache['1337'].keys())).toMatchObject([1, 3]);
      expect(updatedState.cache['1337'].get(1).property).toEqual('updated value');
    });
    test('Existent folder and non-existent message, should NOT add message entry in folder cache', () => {
      // Given
      const initialState = {...INITIAL_STATE.messages};
      initialState.cache = {...initialState.cache};
      initialState.cache['1337'] = new Map([{uid: 3}].map(m => [m.uid, m]));

      // When
      const updatedState = messages(initialState, {
        type: ActionTypes.MESSAGES_UPDATE_CACHE_IF_EXIST,
        payload: {
          folder: {folderId: '1337'},
          messages: [{uid: 1, property: 'new value'}]
        }
      });

      // Then
      expect(initialState).toMatchObject(updatedState);
      expect(updatedState.cache['1337'].size).toEqual(1);
      expect(Array.from(updatedState.cache['1337'].keys())).toMatchObject([3]);
    });
    test('Existent folder with messages and locked entries, should only update non-blocked existent message entry in cache', () => {
      // Given
      const initialState = {...INITIAL_STATE.messages};
      initialState.cache = {...initialState.cache};
      initialState.cache['1337'] = new Map(
        [
          {uid: 1, messageId: '<blockedMessage@server.com>', property: 'initial value'},
          {uid: 3, messageId: '<notBlocked2@server.com>', property: 'initial value'}
        ]
          .map(m => [m.uid, m]));
      initialState.locked = ['<blockedMessage@server.com>'];

      // When
      const updatedState = messages(initialState, {
        type: ActionTypes.MESSAGES_UPDATE_CACHE_IF_EXIST,
        payload: {
          folder: {folderId: '1337'},
          messages: [
            {uid: 1, messageId: '<blockedMessage@server.com>', property: 'updated value'},
            {uid: 2, messageId: '<notBlocked1@server.com>', property: 'updated value'},
            {uid: 3, messageId: '<notBlocked2@server.com>', property: 'updated value'}
          ]
        }
      });

      // Then
      expect(initialState).not.toMatchObject(updatedState);
      expect(updatedState.cache['1337'].size).toEqual(2);
      expect(Array.from(updatedState.cache['1337'].keys())).toEqual([1, 3]);
      expect(updatedState.cache['1337'].get(1).property).toEqual('initial value');
      expect(updatedState.cache['1337'].get(3).property).toEqual('updated value');
    });
    test('Existent folder with messages and locked entries ignored,' +
      'should only update non-blocked existent message entry in cache', () => {
      // Given
      const initialState = {...INITIAL_STATE.messages};
      initialState.cache = {...initialState.cache};
      initialState.cache['1337'] = new Map(
        [
          {uid: 1, messageId: '<blockedMessage@server.com>', property: 'initial value'},
          {uid: 3, messageId: '<notBlocked2@server.com>', property: 'initial value'}
        ]
          .map(m => [m.uid, m]));
      initialState.locked = ['<blockedMessage@server.com>'];

      // When
      const updatedState = messages(initialState, {
        type: ActionTypes.MESSAGES_UPDATE_CACHE_IF_EXIST,
        payload: {
          folder: {folderId: '1337'},
          messages: [
            {uid: 1, messageId: '<blockedMessage@server.com>', property: 'updated value'},
            {uid: 2, messageId: '<notBlocked1@server.com>', property: 'updated value'},
            {uid: 3, messageId: '<notBlocked2@server.com>', property: 'updated value'}
          ],
          ignoreLocked: true
        }
      });

      // Then
      expect(initialState).not.toMatchObject(updatedState);
      expect(updatedState.cache['1337'].size).toEqual(2);
      expect(Array.from(updatedState.cache['1337'].keys())).toEqual([1, 3]);
      expect(updatedState.cache['1337'].get(1).property).toEqual('updated value');
      expect(updatedState.cache['1337'].get(3).property).toEqual('updated value');
    });
  });
  describe('MESSAGES_DELETE_FROM_CACHE', () => {
    test('Non-existent folder, should return same state', () => {
      // Given
      const initialState = {...INITIAL_STATE.messages};
      initialState.cache = {...initialState.cache};
      initialState.cache['1337'] = new Map();
      Array(10).fill('').map((v, i) => i).forEach(i => initialState.cache['1337'].set(i, {uid: i}));

      // When
      const updatedState = messages(initialState, deleteFromCache({folderId: '313373'},
        [{uid: 1}, {uid: 3}, {uid: 3}, {uid: 7}]));

      // Then
      expect(updatedState.cache['1337'].size).toEqual(10);
      expect(updatedState).toMatchObject(initialState);
    });
    test('Array of messages, should delete existing messages in cache', () => {
      // Given
      const initialState = {...INITIAL_STATE.messages};
      initialState.cache = {...initialState.cache};
      initialState.cache['1337'] = new Map();
      Array(10).fill('').map((v, i) => i).forEach(i => initialState.cache['1337'].set(i, {uid: i}));

      // When
      const updatedState = messages(initialState, deleteFromCache({folderId: '1337'},
        [{uid: 1}, {uid: 3}, {uid: 3}, {uid: 7}]));

      // Then
      expect(initialState).not.toMatchObject(updatedState);
      expect(updatedState).not.toMatchObject(initialState);
      expect(updatedState.cache['1337'].size).toEqual(7);
      expect(Array.from(updatedState.cache['1337'].keys())).toMatchObject([0, 2, 4, 5, 6, 8, 9]);
      expect(updatedState.cache['1337'].keys()).not.toContain(1);
      expect(updatedState.cache['1337'].keys()).not.toContain(3);
      expect(updatedState.cache['1337'].keys()).not.toContain(7);
    });
    test('deleteUidRange.to = 0, should delete message 0', () => {
      // Given
      const initialState = {...INITIAL_STATE.messages};
      initialState.cache = {...initialState.cache};
      initialState.cache['1337'] = new Map();
      Array(10).fill('').map((v, i) => i).forEach(i => initialState.cache['1337'].set(i, {uid: i}));

      // When
      const updatedState = messages(initialState, deleteFromCache({folderId: '1337'}, [], {to: 0}));

      // Then
      expect(initialState).not.toMatchObject(updatedState);
      expect(updatedState).not.toMatchObject(initialState);
      expect(updatedState.cache['1337'].size).toEqual(9);
      expect(Array.from(updatedState.cache['1337'].keys())).toMatchObject([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      expect(updatedState.cache['1337'].keys()).not.toContain(0);
    });
    test('deleteUidRange.from = 0, should delete all messages', () => {
      // Given
      const initialState = {...INITIAL_STATE.messages};
      initialState.cache = {...initialState.cache};
      initialState.cache['1337'] = new Map();
      Array(10).fill('').map((v, i) => i).forEach(i => initialState.cache['1337'].set(i, {uid: i}));

      // When
      const updatedState = messages(initialState, deleteFromCache({folderId: '1337'}, [], {from: 0}));

      // Then
      expect(initialState).not.toMatchObject(updatedState);
      expect(updatedState).not.toMatchObject(initialState);
      expect(updatedState.cache['1337'].size).toEqual(0);
    });
    test('deleteUidRange.from = 9 deleteUidRange.to = 9, should delete message 9', () => {
      // Given
      const initialState = {...INITIAL_STATE.messages};
      initialState.cache = {...initialState.cache};
      initialState.cache['1337'] = new Map();
      Array(10).fill('').map((v, i) => i).forEach(i => initialState.cache['1337'].set(i, {uid: i}));

      // When
      const updatedState = messages(initialState, deleteFromCache({folderId: '1337'}, [], {from: 9, to: 9}));

      // Then
      expect(initialState).not.toMatchObject(updatedState);
      expect(updatedState).not.toMatchObject(initialState);
      expect(updatedState.cache['1337'].size).toEqual(9);
      expect(Array.from(updatedState.cache['1337'].keys())).toMatchObject([0, 1, 2, 3, 4, 5, 6, 7, 8]);
      expect(updatedState.cache['1337'].keys()).not.toContain(9);
    });
    test('deleteUidRange.from = 1 deleteUidRange.to = 8, should keep messages 0 and 9', () => {
      // Given
      const initialState = {...INITIAL_STATE.messages};
      initialState.cache = {...initialState.cache};
      initialState.cache['1337'] = new Map();
      Array(10).fill('').map((v, i) => i).forEach(i => initialState.cache['1337'].set(i, {uid: i}));

      // When
      const updatedState = messages(initialState, deleteFromCache({folderId: '1337'}, [], {from: 1, to: 8}));

      // Then
      expect(initialState).not.toMatchObject(updatedState);
      expect(updatedState).not.toMatchObject(initialState);
      expect(updatedState.cache['1337'].size).toEqual(2);
      expect(Array.from(updatedState.cache['1337'].keys())).toMatchObject([0, 9]);
      expect(updatedState.cache['1337'].keys()).not.toContain(1);
      expect(updatedState.cache['1337'].keys()).not.toContain(2);
      expect(updatedState.cache['1337'].keys()).not.toContain(3);
      expect(updatedState.cache['1337'].keys()).not.toContain(4);
      expect(updatedState.cache['1337'].keys()).not.toContain(5);
      expect(updatedState.cache['1337'].keys()).not.toContain(6);
      expect(updatedState.cache['1337'].keys()).not.toContain(7);
      expect(updatedState.cache['1337'].keys()).not.toContain(8);
    });
  });
  describe('MESSAGES_RENAME_CACHE', () => {
    test('Non-existent folder with messages,  should return same state', () => {
      // Given
      const initialState = {...INITIAL_STATE.messages};
      initialState.cache = {...initialState.cache};
      initialState.cache['1337'] = new Map([{uid: 3}, {uid: 1}].map(m => [m.uid, m]));

      // When
      const updatedState = messages(initialState, {
        type: ActionTypes.MESSAGES_RENAME_CACHE,
        payload: {
          oldId: '313373',
          newId: '1337'
        }
      });

      // Then
      expect(updatedState.cache['1337'].size).toEqual(2);
      expect(updatedState).toMatchObject(initialState);
    });
    test('Existent folder with messages, should rename folder entry in cache', () => {
      // Given
      const initialState = {...INITIAL_STATE.messages};
      initialState.cache = {...initialState.cache};
      initialState.cache['1337'] = new Map([{uid: 3}, {uid: 1}].map(m => [m.uid, m]));

      // When
      const updatedState = messages(initialState, {
        type: ActionTypes.MESSAGES_RENAME_CACHE,
        payload: {
          oldId: '1337',
          newId: '313373'
        }
      });

      // Then
      expect(initialState).not.toMatchObject(updatedState);
      expect(Object.keys(updatedState.cache)).not.toContain('1337');
      expect(Object.keys(updatedState.cache)).toContain('313373');
      expect(updatedState.cache['313373'].size).toEqual(2);
      expect(Array.from(updatedState.cache['313373'].keys())).toMatchObject([3, 1]);
    });
  });
  describe('MESSAGES_SET_SELECTED', () => {
    test('Initial empty selection and action select, should select message uids', () => {
      // Given
      const initialState = {...INITIAL_STATE.messages};
      initialState.selected = [];

      // When
      const updatedState = messages(initialState, {
        type: ActionTypes.MESSAGES_SET_SELECTED,
        payload: {
          selected: true,
          messages: [{uid: 3}, {uid: 1}, {uid: 7}]
        }
      });

      // Then
      expect(initialState).not.toMatchObject(updatedState);
      expect(updatedState.selected.length).toEqual(3);
      expect(updatedState.selected).toMatchObject([3, 1, 7]);
    });
    test('Initial selection containing one of the messages and action select, should select message uids', () => {
      // Given
      const initialState = {...INITIAL_STATE.messages};
      initialState.selected = [3];

      // When
      const updatedState = messages(initialState, {
        type: ActionTypes.MESSAGES_SET_SELECTED,
        payload: {
          selected: true,
          messages: [{uid: 3}, {uid: 1}, {uid: 7}]
        }
      });

      // Then
      expect(initialState).not.toMatchObject(updatedState);
      expect(updatedState.selected.length).toEqual(3);
      expect(updatedState.selected).toMatchObject([3, 1, 7]);
    });
    test('Initial selection NOT containing one of the messages and action select, should select message uids', () => {
      // Given
      const initialState = {...INITIAL_STATE.messages};
      initialState.selected = [9];

      // When
      const updatedState = messages(initialState, {
        type: ActionTypes.MESSAGES_SET_SELECTED,
        payload: {
          selected: true,
          messages: [{uid: 3}, {uid: 1}, {uid: 7}]
        }
      });

      // Then
      expect(initialState).not.toMatchObject(updatedState);
      expect(updatedState.selected.length).toEqual(4);
      expect(updatedState.selected).toMatchObject([9, 3, 1, 7]);
    });
    test('Initial selection containing one of the messages and action deselect, should deselect message uids', () => {
      // Given
      const initialState = {...INITIAL_STATE.messages};
      initialState.selected = [3];

      // When
      const updatedState = messages(initialState, {
        type: ActionTypes.MESSAGES_SET_SELECTED,
        payload: {
          selected: false,
          messages: [{uid: 3}, {uid: 1}, {uid: 7}]
        }
      });

      // Then
      expect(initialState).not.toMatchObject(updatedState);
      expect(updatedState.selected.length).toEqual(0);
    });
  });
  describe('MESSAGES_CLEAR_SELECTED', () => {
    test('Initial selection containing messages, should clear selection', () => {
      // Given
      const initialState = {...INITIAL_STATE.messages};
      initialState.selected = [1, 3, 7];

      // When
      const updatedState = messages(initialState, {
        type: ActionTypes.MESSAGES_CLEAR_SELECTED
      });

      // Then
      expect(initialState).not.toMatchObject(updatedState);
      expect(updatedState.selected.length).toEqual(0);
    });
    test('Initial empty selection, should remain empty', () => {
      // Given
      const initialState = {...INITIAL_STATE.messages};
      initialState.selected = [];

      // When
      const updatedState = messages(initialState, {
        type: ActionTypes.MESSAGES_CLEAR_SELECTED
      });

      // Then
      expect(updatedState).toMatchObject(initialState);
      expect(updatedState.selected.length).toEqual(0);
    });
  });
  describe('MESSAGES_LOCK_ADD', () => {
    test('Initial empty locked, payload with several messages (some with no messageId),' +
      'should add all valid entries', () => {
      // Given
      const initialState = {...INITIAL_STATE.messages, locked: []};
      const payload = [
        {uid: 1, messageId: '<entry1@server.com>'},
        {uid: 2},
        {uid: 3, messageId: ''},
        {uid: 4, messageId: null},
        // eslint-disable-next-line no-undefined
        {uid: 5, messageId: undefined},
        {uid: 6, messageId: '<entry6@server.com>'}
      ];

      // When
      const updatedState = messages(initialState, {
        type: ActionTypes.MESSAGES_LOCK_ADD, payload
      });

      // Then
      expect(initialState.locked).toEqual([]);
      expect(updatedState.locked).toEqual(['<entry1@server.com>', '<entry6@server.com>']);
    });
    test('Initial locked list with entries, payload with several messages an already existent entry,' +
      'should keep old and add new valid entries (even if already present)', () => {
      // Given
      const initialState = {...INITIAL_STATE.messages, locked: ['<repeated>']};
      const payload = [
        {uid: 1, messageId: '<entry1@server.com>'},
        {uid: 2},
        {uid: 3, messageId: ''},
        {uid: 4, messageId: null},
        // eslint-disable-next-line no-undefined
        {uid: 5, messageId: undefined},
        {uid: 6, messageId: '<entry6@server.com>'},
        {uid: 7, messageId: '<repeated>'}
      ];

      // When
      const updatedState = messages(initialState, {
        type: ActionTypes.MESSAGES_LOCK_ADD, payload
      });

      // Then
      expect(initialState.locked).toEqual(['<repeated>']);
      expect(updatedState.locked)
        .toEqual(['<repeated>', '<entry1@server.com>', '<entry6@server.com>', '<repeated>']);
    });
  });
  describe('MESSAGES_LOCK_REMOVE', () => {
    test('Initial empty locked list, payload with several messages (some with no messageId),' +
      'should remain empty', () => {
      // Given
      const initialState = {...INITIAL_STATE.messages, locked: []};
      const payload = [
        {uid: 1, messageId: '<entry1@server.com>'},
        {uid: 6, messageId: '<entry6@server.com>'}
      ];

      // When
      const updatedState = messages(initialState, {
        type: ActionTypes.MESSAGES_LOCK_REMOVE, payload
      });

      // Then
      expect(initialState.locked).toEqual([]);
      expect(updatedState.locked).toEqual([]);
    });
    test('Initial locked list with repeated values, payload with several messages (some with no messageId),' +
      'should keep instance of repeated value and remove others', () => {
      // Given
      const initialState = {...INITIAL_STATE.messages, locked: [
        '<repeated>', '<repeated>', '<repeated>', '<entry1@server.com>', '<entry2@server.com>'
      ]};
      const payload = [
        {uid: 1, messageId: '<entry1@server.com>'},
        {uid: 2},
        {uid: 3, messageId: ''},
        {uid: 4, messageId: null},
        // eslint-disable-next-line no-undefined
        {uid: 5, messageId: undefined},
        {uid: 6, messageId: '<entry6@server.com>'},
        {uid: 7, messageId: '<repeated>'}
      ];

      // When
      const updatedState = messages(initialState, {
        type: ActionTypes.MESSAGES_LOCK_REMOVE, payload
      });

      // Then
      expect(initialState.locked)
        .toEqual(['<repeated>', '<repeated>', '<repeated>', '<entry1@server.com>', '<entry2@server.com>']);
      expect(updatedState.locked)
        .toEqual(['<repeated>', '<repeated>', '<entry2@server.com>']);
    });
  });
});
