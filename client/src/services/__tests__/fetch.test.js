import {abortFetch, isSuccessful, toJson} from '../fetch';


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
