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
  test('Messages BE Request', () => {
    const updatedState = messages(INITIAL_STATE.messages, {type: ActionTypes.MESSAGES_BE_REQUEST});
    expect(updatedState.activeRequests).toBe(1);
  });
  test('Messages BE Request completed (was 0)', () => {
    const updatedState = messages(INITIAL_STATE.messages, {type: ActionTypes.MESSAGES_BE_REQUEST_COMPLETED});
    expect(updatedState.activeRequests).toBe(0);
  });
  test('Messages BE Request completed (was 2)', () => {
    const updatedState = messages({...INITIAL_STATE.messages, activeRequests: 2},
      {type: ActionTypes.MESSAGES_BE_REQUEST_COMPLETED});
    expect(updatedState.activeRequests).toBe(1);
  });
  test('Messages set cache (original cache)', () => {
    const replacedCachePayload = {otherFolder: {}};

    const updatedState = messages({...INITIAL_STATE.messages, cache: {existingFolder: {}}},
      {type: ActionTypes.MESSAGES_SET_CACHE, payload: replacedCachePayload});

    expect(updatedState.cache).not.toHaveProperty('existingFolder');
    expect(updatedState.cache).toHaveProperty('otherFolder', {});
  });
  describe('MESSAGES_DELETE_FROM_CACHE', () => {
    test('Non-existent folder, should return same state', () => {
      // Given
      const initialState = {...INITIAL_STATE.messages};
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
      initialState.cache['1337'] = new Map();
      Array(10).fill('').map((v, i) => i).forEach(i => initialState.cache['1337'].set(i, {uid: i}));

      // When
      const updatedState = messages(initialState, deleteFromCache({folderId: '1337'},
        [{uid: 1}, {uid: 3}, {uid: 3}, {uid: 7}]));

      // Then
      expect(updatedState).not.toMatchObject(initialState);
      expect(updatedState.cache['1337'].size).toEqual(7);
      expect(Array.from(updatedState.cache['1337'].keys())).toEqual(expect.arrayContaining([0, 2, 4, 5, 6, 8, 9]));
      expect(updatedState.cache['1337'].keys()).not.toContain(1);
      expect(updatedState.cache['1337'].keys()).not.toContain(3);
      expect(updatedState.cache['1337'].keys()).not.toContain(7);
    });
    test('deleteUidRange.to = 0, should delete message 0', () => {
      // Given
      const initialState = {...INITIAL_STATE.messages};
      initialState.cache['1337'] = new Map();
      Array(10).fill('').map((v, i) => i).forEach(i => initialState.cache['1337'].set(i, {uid: i}));

      // When
      const updatedState = messages(initialState, deleteFromCache({folderId: '1337'}, [], {to: 0}));

      // Then
      expect(updatedState).not.toMatchObject(initialState);
      expect(updatedState.cache['1337'].size).toEqual(9);
      expect(Array.from(updatedState.cache['1337'].keys())).toEqual(expect.arrayContaining([1, 2, 3, 4, 5, 6, 7, 8, 9]));
      expect(updatedState.cache['1337'].keys()).not.toContain(0);
    });
    test('deleteUidRange.from = 0, should delete all messages', () => {
      // Given
      const initialState = {...INITIAL_STATE.messages};
      initialState.cache['1337'] = new Map();
      Array(10).fill('').map((v, i) => i).forEach(i => initialState.cache['1337'].set(i, {uid: i}));

      // When
      const updatedState = messages(initialState, deleteFromCache({folderId: '1337'}, [], {from: 0}));

      // Then
      expect(updatedState).not.toMatchObject(initialState);
      expect(updatedState.cache['1337'].size).toEqual(0);
    });
    test('deleteUidRange.from = 9 deleteUidRange.to = 9, should delete message 9', () => {
      // Given
      const initialState = {...INITIAL_STATE.messages};
      initialState.cache['1337'] = new Map();
      Array(10).fill('').map((v, i) => i).forEach(i => initialState.cache['1337'].set(i, {uid: i}));

      // When
      const updatedState = messages(initialState, deleteFromCache({folderId: '1337'}, [], {from: 9, to: 9}));

      // Then
      expect(updatedState).not.toMatchObject(initialState);
      expect(updatedState.cache['1337'].size).toEqual(9);
      expect(Array.from(updatedState.cache['1337'].keys())).toEqual(expect.arrayContaining([0, 1, 2, 3, 4, 5, 6, 7, 8]));
      expect(updatedState.cache['1337'].keys()).not.toContain(9);
    });
    test('deleteUidRange.from = 1 deleteUidRange.to = 8, should keep messages 0 and 9', () => {
      // Given
      const initialState = {...INITIAL_STATE.messages};
      initialState.cache['1337'] = new Map();
      Array(10).fill('').map((v, i) => i).forEach(i => initialState.cache['1337'].set(i, {uid: i}));

      // When
      const updatedState = messages(initialState, deleteFromCache({folderId: '1337'}, [], {from: 1, to: 8}));

      // Then
      expect(updatedState).not.toMatchObject(initialState);
      expect(updatedState.cache['1337'].size).toEqual(2);
      expect(Array.from(updatedState.cache['1337'].keys())).toEqual(expect.arrayContaining([0, 9]));
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
});
