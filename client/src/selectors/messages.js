import {getFromKey} from '../services/message-filters';


export const getSelectedFolderMessageList = state => {
  const {application, messages} = state;
  if (application && application.selectedFolderId && messages && messages.cache[application.selectedFolderId]) {
    const messageFilter = getFromKey(application.messageFilterKey);
    return messageFilter.selector(Array.from(state.messages.cache[state.application.selectedFolderId].values()))
      .sort((a, b) => {
        if (a.receivedDate > b.receivedDate) {
          return -1;
        } else if (a.receivedDate < b.receivedDate) {
          return 1;
        }
        return 0;
      });
  }
  return [];
};
