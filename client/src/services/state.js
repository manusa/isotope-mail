const STORAGE_KEY = 'ISOTOPE_MAIL_CLIENT_STATE';

function emptyState() {
  return {};
}

export function loadState() {
  const storedState = sessionStorage.getItem(STORAGE_KEY);
  if (storedState === null) {
    return emptyState();
  }
  const recoveredState = JSON.parse(storedState);
  // Convert Array to Map after recovering
  Object.entries(recoveredState.messages.cache).forEach(e => {
    recoveredState.messages.cache[e[0]] = new Map(e[1].map(m => [m.uid, m]));
  });
  return recoveredState;
}

export function saveState(state) {
  // Convert Maps to Arrays before saving
  const newState = {...state};
  newState.messages = {...state.messages};
  newState.messages.cache = {};
  Object.entries(state.messages.cache).forEach(e => {
    newState.messages.cache[e[0]] = Array.from(e[1].values());
  });
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
}
