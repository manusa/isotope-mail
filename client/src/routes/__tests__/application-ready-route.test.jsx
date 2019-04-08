import React from 'react';
import {shallow} from 'enzyme/build/index';
import {ApplicationReadyRoute} from '../application-ready-route';

describe('ApplicationReadyRoute component test suite', () => {
  test('Render, NO isotope configuration, should render redirect to configuration not found', () => {
    // Given
    const applicationReadyRoute = <ApplicationReadyRoute />;
    // When
    const result = applicationReadyRoute.type.prototype.render();
    // Then
    expect(result.type.name).toBe('Redirect');
    expect(result.props.to).toBe('/configuration-not-found');
  });
  test('Render, with isotope configuration and NO credentials, should render redirect to login', () => {
    // Given
    window.isotopeConfiguration = {};
    const props = {application: {user: {}}};
    const applicationReadyRoute = <ApplicationReadyRoute {...props} />;
    Object.getPrototypeOf(applicationReadyRoute.type).prototype.computeMatch = () => {};
    Object.getPrototypeOf(applicationReadyRoute.type).prototype.getChildContext = () => ({});
    // When
    const result = shallow(applicationReadyRoute);
    // Then
    expect(result.type().name).toBe('Redirect');
    expect(result.props().to).toBe('/login');
  });
  test('Render, with isotope configuration and NO credentials but login path, should render route', () => {
    // Given
    window.isotopeConfiguration = {};
    const props = {application: {user: {}}, path: '/login'};
    const applicationReadyRoute = <ApplicationReadyRoute {...props} />;
    Object.getPrototypeOf(applicationReadyRoute.type).prototype.computeMatch = () => {};
    Object.getPrototypeOf(applicationReadyRoute.type).prototype.getChildContext = () => ({});
    // When
    const result = shallow(applicationReadyRoute);
    // Then
    expect(result.type().name).toBe('Route');
  });
  test('Render, with isotope configuration and credentials, should render route', () => {
    // Given
    window.isotopeConfiguration = {};
    const props = {application: {user: {credentials: 'sesame'}}};
    const applicationReadyRoute = <ApplicationReadyRoute {...props} />;
    Object.getPrototypeOf(applicationReadyRoute.type).prototype.computeMatch = () => {};
    Object.getPrototypeOf(applicationReadyRoute.type).prototype.getChildContext = () => ({});
    // When
    const result = shallow(applicationReadyRoute);
    // Then
    expect(result.type().name).toBe('Route');
  });
});
