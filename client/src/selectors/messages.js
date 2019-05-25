import get from 'lodash/get';
import {createSelector} from 'reselect';
import {messageFilterKey, messageFilterText, selectedFolderId} from './application';
import {getFromKey} from '../services/message-filters';

const containsIgnoreCase = string1 => string2 =>
  string1 && string2 && string2.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').indexOf(
    string1.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  ) !== -1;

const messageTextFilter = text => message => {
  let ret = false;
  if (containsIgnoreCase(text)(message.subject)) {
    ret = true;
  }
  if (!ret && message.from.some(containsIgnoreCase(text))) {
    ret = true;
  }
  if (!ret && message.recipients.map(r => r.address).some(containsIgnoreCase(text))) {
    ret = true;
  }
  return ret;
};

export const cache = state => get(state, 'messages.cache');
export const selectedMessagesIds = state => get(state, 'messages.selected');

/**
 * Returns a map containing the selected folder's messages or undefined if not found.
 *
 * @param state to perform selections on
 * @returns {Map<string, object>} map containing selected folder's messages
 */
export const selectedFolderMessageList = createSelector(
  cache,
  selectedFolderId,
  (resolvedCache, resolvedSelectedFolderId) => get(resolvedCache, resolvedSelectedFolderId)
);
const selectedFolderMessageListArray = createSelector(
  selectedFolderMessageList,
  resolvedSelectedFolderMessageList => {
    if (resolvedSelectedFolderMessageList) {
      return Array.from(resolvedSelectedFolderMessageList.values());
    }
    return [];
  }
);

export const selectedFolderMessagesFiltered = createSelector(
  selectedFolderMessageListArray,
  messageFilterKey,
  messageFilterText,
  (messages, resolvedMessageFilterKey, resolvedMessageFilterText) => {
    const messageKeyFilter = getFromKey(resolvedMessageFilterKey);
    let filteredMessages = messageKeyFilter.selector(messages);
    if (resolvedMessageFilterText) {
      filteredMessages = filteredMessages.filter(messageTextFilter(resolvedMessageFilterText));
    }
    return filteredMessages
      .sort((a, b) => {
        if (a.receivedDate > b.receivedDate) {
          return -1;
        } else if (a.receivedDate < b.receivedDate) {
          return 1;
        }
        return 0;
      });
    // return orderBy(filteredMessages, 'receivedDate', 'desc');
  }
);

export const selectedFolderMessagesFilteredAndSelected = createSelector(
  selectedMessagesIds,
  selectedFolderMessagesFiltered,
  (selectedIds, messages) => messages.filter(m => selectedIds.indexOf(m.uid) > -1)
);
