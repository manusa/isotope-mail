import React from 'react';
import ReactDOM from 'react-dom';
import {createStore} from 'redux';
import {Provider} from 'react-redux';
import Routes from './routes/routes';
import rootReducer from './reducers';
import {loadState, saveState} from './services/state';

/**
 * Starts application asynchronously once all of the required information is available (loadState)
 *
 * @returns {Promise<void>}
 */
async function init () {
  const previousState = await loadState();
  let enhancer;
  if (process.env.NODE_ENV === 'development' && window.__REDUX_DEVTOOLS_EXTENSION__) {
    enhancer = window.__REDUX_DEVTOOLS_EXTENSION__();
  }
  const store = createStore(rootReducer, previousState, enhancer);

  store.subscribe(() => saveState(store.getState()));

  ReactDOM.render(
    <Provider store={store}>
      <Routes />
    </Provider>,
    document.getElementById('root')
  );
}

init();

if (module.hot) {
  module.hot.accept();
}
