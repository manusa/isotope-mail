import React from 'react';
import ReactDOM from 'react-dom';
import {createStore} from 'redux';
import {Provider} from 'react-redux';
import Routes from './routes/routes';
import rootReducer from './reducers';
import {loadState, saveState} from './services/state';

async function init () {
  const previousState = await loadState();
  const store = createStore(rootReducer, previousState,
    process.env.NODE_ENV === 'development'
    && window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

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
