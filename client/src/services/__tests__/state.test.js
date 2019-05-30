import {loadState, saveState} from '../state';
import {FolderTypes} from '../folder';
import * as indexedDb from '../indexed-db';
import {INITIAL_STATE} from '../../reducers';

describe('State service test suite', () => {
  describe('loadState', () => {
    test('empty session storage, should return initial state', done => {
      // When
      const statePromise = loadState();

      // Then
      statePromise.then(state => {
        expect(state).toEqual(INITIAL_STATE);
        done();
      });
    });
    test('session storage with existing values, should return persisted state', done => {
      // Given
      sessionStorage.setItem('KEY_USER_ID', 'userId');
      sessionStorage.setItem('KEY_HASH', 'hash');
      indexedDb.recoverState = jest.fn(() => Promise.resolve({
        application: {object: 1},
        folders: {items: [], explodedItems: {1337: {folderId: '1337', name: 'INBOX', fullName: 'INBOX', children: []}}},
        login: {formValues: {serverHost: 'server.host'}},
        messages: {cache: {object: 2}}
      }));

      // When
      const statePromise = loadState();

      // Then
      statePromise.then(state => {
        expect(state.application).toEqual({object: 1});
        expect(state.messages).toEqual(expect.objectContaining({cache: {object: 2}}));
        expect(state.folders.items).toHaveLength(0);
        expect(state.folders.explodedItems[1337])
          .toEqual(expect.objectContaining({folderId: '1337', name: 'INBOX', children: []}));
        expect(state.folders.explodedItems[1337].type).toBe(FolderTypes.INBOX);
        expect(state.login.formValues).toEqual({serverHost: 'server.host'});
        done();
      });
    });
  });
  describe('saveState', () => {
    test('valid state, state is persisted and sessionStorage is updated', () => {
      // Given
      const state = {
        application: {user: {id: '1337', hash: '313373'}}
      };
      indexedDb.persistState = jest.fn();

      // When
      saveState(null, state);

      // Then
      expect(indexedDb.persistState).toHaveBeenCalledTimes(1);
      expect(sessionStorage.getItem('KEY_USER_ID')).toBe('1337');
      expect(sessionStorage.getItem('KEY_HASH')).toBe('313373');
    });
  });
});
