import {persistState, recoverStateByState} from './indexed-db';
import {INITIAL_STATE} from '../reducers';

const STORAGE_KEY = 'ISOTOPE_MAIL_CLIENT_STATE';

function emptyState() {
  return JSON.parse(JSON.stringify(INITIAL_STATE));
}

export async function loadState() {
  const state = emptyState();
  const sessionStoredState = sessionStorage.getItem(STORAGE_KEY);
  if (sessionStoredState === null) {
    return state;
  }
  const sessionState = JSON.parse(sessionStoredState);
  state.application = sessionState.application;

  const dbState = await recoverStateByState(state);
  if (dbState && dbState !== null) {
    sessionState.folders.items = [...dbState.folders.items];
    sessionState.messages.cache = {...dbState.messages.cache};
  }
  return sessionState;
}

export function saveState(state) {
  try {
    // Store only application in session storage
    const stateForSessionStorage = emptyState();
    stateForSessionStorage.application = {...state.application};
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stateForSessionStorage));

    // Store in IndexedDb (Encrypted)
    persistState(state);
  } catch (e) {
    console.log('Session storage is full');
  }
}
