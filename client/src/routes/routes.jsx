import React, {Component} from 'react';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import App from '../components/app';
import AppUiComponents from '../components/app-ui-components';

class Routes extends Component {
  render() {
    return (
      <Router basename='/'>
        <Switch>
          <Route path="/" component={App} />
          <Route path="/mui-components" component={AppUiComponents} />
        </Switch>
      </Router>
    );
  }
}

export default Routes;
