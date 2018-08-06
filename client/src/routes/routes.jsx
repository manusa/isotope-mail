import React, {Component} from 'react';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import '../styles/main.scss';
import App from '../components/app';

class Routes extends Component {
  render() {
    return (
      <Router basename='/'>
        <Switch>
          <Route exact path="/" component={App} />
        </Switch>
      </Router>
    );
  }
}

export default Routes;
