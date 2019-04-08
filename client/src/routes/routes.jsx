import React, {Component} from 'react';
import {Router, Route, Switch} from 'react-router-dom';
import history from './history';
import ApplicationReadyRoute from './application-ready-route';
import App from '../components/app';
import ConfigurationNotFound from '../components/error-pages/configuration-not-found';
import Login from '../components/login/login';
import '../styles/main.scss';

class Routes extends Component {
  render() {
    return (
      <Router basename='/' history={history}>
        <Switch>
          <Route exact path="/configuration-not-found" render={() => <ConfigurationNotFound />} />
          <ApplicationReadyRoute exact path="/login" render={() => <Login />} />
          <ApplicationReadyRoute exact path="/" component={App} />
        </Switch>
      </Router>
    );
  }
}

export default Routes;
