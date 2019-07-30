import React from 'react';
import {shallow} from 'enzyme/build';

describe('Google Analytics component test suite', () => {
  let googleAnalyticsTrackingId;
  let GoogleAnalytics;
  beforeEach(() => {
    jest.mock('../selectors');
    googleAnalyticsTrackingId = require('../selectors').googleAnalyticsTrackingId;
    GoogleAnalytics = require('../').default;
  });
  describe('Snapshot render', () => {
    test('Tracking ID set in global variable, should render script', () => {
      // Given
      googleAnalyticsTrackingId.mockImplementationOnce(() => 'UA-1337-33');
      // When
      const routes = shallow(<GoogleAnalytics />);
      // Then
      expect(routes).toMatchSnapshot();
    });
    test('Tracking ID NOT set in global variable, should render empty', () => {
      // Given
      googleAnalyticsTrackingId.mockImplementationOnce(() => null);
      // When
      const routes = shallow(<GoogleAnalytics />);
      // Then
      expect(routes).toMatchSnapshot();
    });
  });
});
