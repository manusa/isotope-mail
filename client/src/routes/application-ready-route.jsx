import React from 'react';
import {connect} from 'react-redux';
import {Redirect, Route} from 'react-router-dom';
import {getIsotopeConfiguration} from '../selectors/globals';

/**
 * Extended Route:
 *  - Checks for application configuration to be loaded.
 *  - Checks for user to be authenticated
 * If all requirements are met redirects user to the configured path
 */
export class ApplicationReadyRoute extends Route {
  render() {
    const loginPath = '/login';
    if (!getIsotopeConfiguration()) {
      return <Redirect to='/configuration-not-found' />;
    } else if (!this.props.application.user.credentials && this.props.path !== loginPath) {
      return <Redirect to={loginPath} />;
    }
    return <Route {...this.props} />;
  }
}

const mapStateToProps = state => ({
  application: state.application
});

export default connect(mapStateToProps)(ApplicationReadyRoute);
