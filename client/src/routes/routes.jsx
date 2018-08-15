import React, {Component} from 'react';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import App from '../components/app';
import Login from '../components/login/login';
import '../styles/main.scss';
import PrivateRoute from './private-route';

class Routes extends Component {
  render() {
    return (
      <Router basename='/'>
        <Switch>
          <Route exact path="/login" render={() => <Login />} />
          <PrivateRoute exact path="/" component={App} />
        </Switch>
      </Router>
    );
  }
}

export default Routes;
