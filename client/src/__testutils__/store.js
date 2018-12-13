import {createStore} from 'redux';
import rootReducer, {INITIAL_STATE} from '../reducers';

export const createMockStore = initialState => createStore(rootReducer, initialState);
export const MOCK_STORE = createMockStore(INITIAL_STATE);
