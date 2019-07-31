import React from 'react';
import ReactDOM from 'react-dom';
import {createStore} from 'redux';
import {Provider} from 'react-redux';
import {I18nextProvider} from 'react-i18next';
import {fetchConfiguration} from './services/configuration';
import debounce from './services/debounce';
import i18n from './services/i18n';
import {loadState, saveState} from './services/state';
import Routes from './routes/routes';
import rootReducer from './reducers';

const SAVE_STATE_DEBOUNCE_PERIOD_IN_MILLIS = 500;

/**
 * Starts application asynchronously once all of the required information is available (loadState)
 *
 * @returns {Promise<void>}
 */
async function init () {
  const [previousState, configuration] = await Promise.all([loadState(), fetchConfiguration()]);
  window.isotopeConfiguration = configuration;
  let enhancer;
  if (process.env.NODE_ENV === 'development' && window.__REDUX_DEVTOOLS_EXTENSION__) {
    enhancer = window.__REDUX_DEVTOOLS_EXTENSION__();
  }
  const store = createStore(rootReducer, previousState, enhancer);

  store.subscribe(debounce(() => saveState(store.dispatch, store.getState()), SAVE_STATE_DEBOUNCE_PERIOD_IN_MILLIS));

  ReactDOM.render(
    <>
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <Routes />
        </I18nextProvider>
      </Provider>
    </>,
    document.getElementById('root')
  );
}

init();

if (module.hot) {
  module.hot.accept();
}
