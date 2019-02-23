import {abortFetch, AuthenticationException, isSuccessful, refreshCredentials, toJson} from '../fetch';
import {ActionTypes} from '../../actions/action-types';


describe('Fetch service test suite', () => {
  describe('toJson', () => {
    test('toJson, OK response, should return json', () => {
      // Given
      const response = {
        ok: true,
        json: jest.fn()
      };
      // When
      toJson(response);

      // Then
      expect(response.json).toHaveBeenCalledTimes(1);
    });
    test('toJson, not OK response, should throw Error', () => {
      // Given
      const response = {
        ok: false,
        status: 404,
        json: jest.fn()
      };
      // When
      expect(() => toJson(response)).toThrow('404');

      // Then
      expect(response.json).not.toHaveBeenCalled();
    });
    test('toJson, unauthorized response, should throw AuthenticationException', () => {
      // Given
      const response = {
        ok: false,
        status: 401,
        json: jest.fn()
      };
      // When
      expect(() => toJson(response)).toThrow(AuthenticationException);

      // Then
      expect(response.json).not.toHaveBeenCalled();
    });
    test('toJson, forbidden response, should throw AuthenticationException', () => {
      // Given
      const response = {
        ok: false,
        status: 403,
        json: jest.fn()
      };
      // When
      expect(() => toJson(response)).toThrow(AuthenticationException);

      // Then
      expect(response.json).not.toHaveBeenCalled();
    });
  });
  describe('refreshCredentials', () => {
    test('refreshCredentials, valid headers, should dispatch refresh', () => {
      // Given
      const response = {headers: {get: jest.fn(() => 'HEADER')}};
      const dispatch = jest.fn(action => {
        expect(action.type).toBe(ActionTypes.APPLICATION_USER_CREDENTIALS_REFRESH);
      });

      // When
      refreshCredentials(dispatch, response);

      // Then
      expect(response.headers.get).toHaveBeenCalledTimes(2);
    });
    test('refreshCredentials, invalid headers, should NOT dispatch refresh', () => {
      // Given
      const response = {headers: {get: jest.fn(() => null)}};
      const dispatch = jest.fn();

      // When
      refreshCredentials(dispatch, response);

      // Then
      expect(response.headers.get).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenCalledTimes(0);
    });
  });
  describe('abortFetch', () => {
    test('abortFetch, valid abortController, should abort', () => {
      // Given
      const abortController = {
        abort: jest.fn()
      };

      // When
      abortFetch(abortController);

      // Then
      expect(abortController.abort).toHaveBeenCalledTimes(1);
    });
  });
  describe('isSuccessful', () => {
    test('isSuccessful, successful status, should return true', () => {
      // Given
      const status = 201;

      // When
      const result = isSuccessful(status);

      // Then
      expect(result).toEqual(true);
    });
    test('isSuccessful, not successful status, should return false', () => {
      // Given
      const status = 400;

      // When
      const result = isSuccessful(status);

      // Then
      expect(result).toEqual(false);
    });
  });
});
