import React from 'react';
import {Router, Route, Switch} from 'react-router-dom';
import history from './history';
import ApplicationReadyRoute from './application-ready-route';
import App from '../components/app';
import ConfigurationNotFound from '../components/error-pages/configuration-not-found';
import Login from '../components/login/login';
import {useAnalytics} from '../google-analytics';
import '../styles/main.scss';

const SwitchWrapper = () => {
  useAnalytics();
  return (
    <Switch>
      <Route exact path="/configuration-not-found" render={() => <ConfigurationNotFound />} />
      <ApplicationReadyRoute exact path="/login" render={() => <Login />} />
      <ApplicationReadyRoute exact path="/" component={App} />
    </Switch>
  );
};
const Routes = () => (
  <Router basename='/' history={history}>
    <SwitchWrapper />
  </Router>
);

export default Routes;
