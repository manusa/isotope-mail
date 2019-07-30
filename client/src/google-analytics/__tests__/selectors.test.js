
describe('Google Analytics selectors test suite', () => {
  let globals;
  let selectors;
  beforeEach(() => {
    jest.mock('../../selectors/globals');
    globals = require('../../selectors/globals');
    selectors = require('../selectors');
  });
  describe('googleAnalyticsTrackingId', () => {
    test('Tacking code exists, should return tracking code', () => {
      // Given
      globals.getIsotopeConfiguration.mockImplementationOnce(() => ({googleAnalyticsTrackingId: 'UA-1337-33'}));
      // When
      const result = selectors.googleAnalyticsTrackingId();
      // Then
      expect(result).toBe('UA-1337-33');
    });
    test('Tacking code NOT in configuration, should return undefined', () => {
      // Given
      globals.getIsotopeConfiguration.mockImplementationOnce(() => ({}));
      // When
      const result = selectors.googleAnalyticsTrackingId();
      // Then
      expect(result).toBeUndefined();
    });
  });
});
