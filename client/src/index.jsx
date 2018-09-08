import React from 'react';
import ReactDOM from 'react-dom';
import {createStore} from 'redux';
import {Provider} from 'react-redux';
import {I18nextProvider} from 'react-i18next';
import i18n from './services/i18n';
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

  store.subscribe(() => saveState(store.dispatch, store.getState()));

  ReactDOM.render(
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <Routes />
      </I18nextProvider>
    </Provider>,
    document.getElementById('root')
  );
}

init();

if (module.hot) {
  module.hot.accept();
}
