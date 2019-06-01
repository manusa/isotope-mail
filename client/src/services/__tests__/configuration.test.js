import {fetchConfiguration, isDesktop} from '../configuration';

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
  describe('isDesktop', () => {
    beforeAll(() => {
      // document....clientWidth as property
      Object.defineProperty(document.documentElement, 'clientWidth', {value: 0, writable: true});
    });
    test('Desktop window viewport, should return true', () => {
      // Given
      window.innerWidth = 601;
      // When
      const result = isDesktop();
      // Then
      expect(result).toBe(true);
    });
    test('Desktop document viewport, should return true', () => {
      // Given
      window.innerWidth = 500;
      document.documentElement.clientWidth = 601;
      // When
      const result = isDesktop();
      // Then
      expect(result).toBe(true);
    });
    test('Mobile viewport, should return true', () => {
      // Given
      window.innerWidth = 599;
      document.documentElement.clientWidth = 594;
      // When
      const result = isDesktop();
      // Then
      expect(result).toBe(false);
    });
  });
});
