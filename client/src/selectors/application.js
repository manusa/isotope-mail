import {get} from 'lodash';
import {createSelector} from 'reselect';
import {getFromKey} from '../services/message-filters';
import MessageFilters from '../services/message-filters';

export const getCredentials = state => get(state, 'application.user.credentials');

export const selectedFolderId = state => get(state, 'application.selectedFolderId');

export const messageFilterKey = state => get(state, 'application.messageFilterKey');

export const messageFilterText = state => get(state, 'application.messageFilterText');

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
