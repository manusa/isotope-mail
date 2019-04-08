import {fetchConfiguration} from '../configuration';

describe('Configuration service test suite', () => {
  describe('fetchConfiguration', () => {
    test(' NOT OK response, should return null', async () => {
      // Given
      global.fetch = jest.fn(() => Promise.resolve({ok: false}));
      // When
      const result = await fetchConfiguration();
      // Then
      expect(result).toBeNull();
    });
    test(' OK response, should return configuration', async () => {
      // Given
      const configuration = {isotopeConfiguration: 'Radioactive'};
      const json = jest.fn(() => configuration);
      global.fetch = jest.fn(() => Promise.resolve({ok: true, json}));
      // When
      const result = await fetchConfiguration();
      // Then
      expect(json).toHaveBeenCalledTimes(1);
      expect(result).toEqual(configuration);
    });
  });
});
