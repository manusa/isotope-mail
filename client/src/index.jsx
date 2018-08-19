import React from 'react';
import ReactDOM from 'react-dom';
import {createStore} from 'redux';
import {Provider} from 'react-redux';
import Routes from './routes/routes';
import rootReducer from './reducers';
import {loadState, saveState} from './services/state';

const store = createStore(rootReducer, loadState(),
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

store.subscribe(() => saveState(store.getState()));

ReactDOM.render(
  <Provider store={store}>
    <Routes />
  </Provider>,
  document.getElementById('root')
);

if (module.hot) {
  module.hot.accept();
}
