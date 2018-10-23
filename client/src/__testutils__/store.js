import {createStore} from 'redux';
import rootReducer, {INITIAL_STATE} from '../reducers';

export const MOCK_STORE = createStore(rootReducer, INITIAL_STATE);
