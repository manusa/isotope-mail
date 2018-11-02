import application from '../application';
import {INITIAL_STATE} from '../index';
import {ActionTypes} from '../../actions/action-types';

describe('Application reducer test suite', () => {
  test('Application default state', () => {
    const applicationDefaultState = application();
    expect(applicationDefaultState).toHaveProperty('title', 'Isotope Mail Client');
    expect(applicationDefaultState).toHaveProperty('user', {});
    expect(applicationDefaultState).toHaveProperty('newMessage', null);
    expect(applicationDefaultState).toHaveProperty('selectedFolderId', {});
    expect(applicationDefaultState).toHaveProperty('renameFolderId', null);
    expect(applicationDefaultState).toHaveProperty('selectedMessage', null);
    expect(applicationDefaultState).toHaveProperty('outbox', null);
    expect(applicationDefaultState).toHaveProperty('pollInterval');
    expect(applicationDefaultState).toHaveProperty('errors.diskQuotaExceeded', false);
    expect(applicationDefaultState).toHaveProperty('activeRequests', 0);
  });
  test('Application BE Request', () => {
    const updatedState = application(INITIAL_STATE.application, {type: ActionTypes.APPLICATION_BE_REQUEST});
    expect(updatedState.activeRequests).toBe(1);
  });
  test('Application BE Request completed (was 0)', () => {
    const updatedState = application(INITIAL_STATE.application, {type: ActionTypes.APPLICATION_BE_REQUEST_COMPLETED});
    expect(updatedState.activeRequests).toBe(0);
  });
  test('Application BE Request completed (was 2)', () => {
    const updatedState = application({...INITIAL_STATE.application, activeRequests: 2},
      {type: ActionTypes.APPLICATION_BE_REQUEST_COMPLETED});
    expect(updatedState.activeRequests).toBe(1);
  });
});
