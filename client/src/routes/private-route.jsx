import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Redirect, Route} from 'react-router-dom';

/**
 * Wrapper class for Route
 */
class PrivateRoute extends Route {
  render() {
    if (this.props.application.user.credentials) {
      return <Route {...this.props} />;
    }
    return <Redirect to='/login' />;
  }
}

const mapStateToProps = state => ({
  application: state.application
});

export default connect(mapStateToProps)(PrivateRoute);
