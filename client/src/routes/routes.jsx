import React, {Component} from 'react';
import {Router, Route, Switch} from 'react-router-dom';
import history from './history';
import PrivateRoute from './private-route';
import App from '../components/app';
import Login from '../components/login/login';
import '../styles/main.scss';

class Routes extends Component {
  render() {
    return (
      <Router basename='/' history={history}>
        <Switch>
          <Route exact path="/login" render={() => <Login />} />
          <PrivateRoute exact path="/" component={App} />
        </Switch>
      </Router>
    );
  }
}

export default Routes;
