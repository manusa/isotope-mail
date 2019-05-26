import get from 'lodash/get';
import {createSelector} from 'reselect';
import {getFromKey} from '../services/message-filters';
import MessageFilters from '../services/message-filters';

export const getCredentials = state => get(state, 'application.user.credentials');
export const selectedFolderId = state => get(state, 'application.selectedFolderId');
export const messageFilterKey = state => get(state, 'application.messageFilterKey');
export const messageFilterText = state => get(state, 'application.messageFilterText');
export const selectedMessage = state => get(state, 'application.selectedMessage');
export const outbox = state => get(state, 'application.outbox');
export const pollInterval = state => get(state, 'application.pollInterval');

export const activeMessageFilter = createSelector(
  messageFilterKey,
  resolvedMessageFilterKey => getFromKey(resolvedMessageFilterKey)
);

export const messageFilterActive = createSelector(
  activeMessageFilter,
  messageFilterText,
  (resolvedActiveMessageFilter, resolvedMessageFilterText) =>
    resolvedActiveMessageFilter.key !== MessageFilters.ALL.key || resolvedMessageFilterText
);
