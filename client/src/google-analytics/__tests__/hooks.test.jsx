import React from 'react';
import {mount} from 'enzyme/build';
import {useAnalytics} from '../hooks';

describe('Google Analytics hooks test suite', () => {
  describe('useAnaltyics', () => {
    let PlaceHolder;
    beforeEach(() => {
      delete window.dataLayer;
      delete window.gtag;
      PlaceHolder = ({updatableProperty = ''}) => {
        useAnalytics();
        return (<span>{updatableProperty}</span>);
      };
    });
    test('componentDidMount, should load script and add helper functions', () => {
      // Given
      window.isotopeConfiguration = {googleAnalyticsTrackingId: 'UA-1337-33'};
      // When
      mount(<PlaceHolder />);
      // Then
      expect(window.gtag).toBeInstanceOf(Function);
      expect(window.dataLayer).toHaveLength(2);
      expect(window.dataLayer.map(args => [...args])).toEqual([
        ['js', expect.any(Date)],
        ['config', 'UA-1337-33', {page_path: '/'}]
      ]);
    });
    test('componentDidUpdate, should update page location', () => {
      // Given
      window.isotopeConfiguration = {googleAnalyticsTrackingId: 'UA-1337-33'};
      const rendered = mount(<PlaceHolder updatableProperty="First Pass" />);
      // When
      rendered.setProps({updatableProperty: 'Second Pass'});
      // Then
      expect(window.gtag).toBeInstanceOf(Function);
      expect(window.dataLayer).toHaveLength(3);
      expect(window.dataLayer.map(args => [...args])).toEqual([
        ['js', expect.any(Date)],
        ['config', 'UA-1337-33', {page_path: '/'}],
        ['config', 'UA-1337-33', {page_path: '/'}]
      ]);
    });
  });
});
