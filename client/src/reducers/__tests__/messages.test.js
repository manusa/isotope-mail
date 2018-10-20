import {ActionTypes} from '../../actions/action-types';
import messages from '../messages';
import {INITIAL_STATE} from '../index';

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
});
