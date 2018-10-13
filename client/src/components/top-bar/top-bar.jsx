import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {FolderTypes} from '../../services/folder';
import {selectMessage} from '../../actions/application';
import {replyMessage} from '../../services/application';
import {moveMessages, setMessagesSeen} from '../../services/message';
import styles from './top-bar.scss';
import mainCss from '../../styles/main.scss';

function _findTrashFolder(foldersState) {
  let trashFolder = Object.values(foldersState.explodedItems).find(f => f.type === FolderTypes.TRASH);
  if (!trashFolder) {
    trashFolder = foldersState.items.find(f => f.name.toUpperCase() === 'TRASH');
  }
  return trashFolder;
}

class TopBar extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const collapsed = this.props.sideBarCollapsed;
    const isEditing = !this.props.newMessage || Object.keys(this.props.newMessage).length !== 0;
    const isMessageViewer = this.props.selectedMessage && Object.keys(this.props.selectedMessage).length > 0;
    let title = this.props.title;
    if (this.props.selectedFolder && this.props.selectedFolder.name
      && this.props.selectedFolder.type !== FolderTypes.INBOX) {
      title = `${this.props.selectedFolder.name} - ${title}`;
    }
    return (
      <header className={`${styles.topBar} ${styles['with-custom-styles']}
      ${collapsed ? '' : styles['with-side-bar']}
      ${mainCss['mdc-top-app-bar']} ${mainCss['mdc-top-app-bar--fixed']}`}>
        <div className={mainCss['mdc-top-app-bar__row']}>
          <section className={`${mainCss['mdc-top-app-bar__section']} ${mainCss['mdc-top-app-bar__section--align-start']}`}>
            {collapsed ?
              <button onClick={this.props.sideBarToggle}
                className={`material-icons ${mainCss['mdc-top-app-bar__navigation-icon']}`}>
                menu
              </button> :
              null
            }
            {isMessageViewer && !isEditing ?
              <Fragment>
                <button onClick={() => this.props.selectMessage(null)}
                  className={`material-icons ${mainCss['mdc-top-app-bar__navigation-icon']}`}>
                  arrow_back
                </button>
              </Fragment>
              :
              <span className={mainCss['mdc-top-app-bar__title']}>{title}</span>
            }
          </section>
          {isEditing ? null :
            <section className={`${mainCss['mdc-top-app-bar__section']} ${mainCss['mdc-top-app-bar__section--align-end']}`}>
              {isMessageViewer ? this.renderMessageViewerActions() : this.renderMessageListActions()}
            </section>
          }
        </div>
      </header>
    );
  }

  renderMessageViewerActions() {
    return (
      <Fragment>
        <button
          onClick={this.props.replyMessage}
          className={`material-icons ${mainCss['mdc-top-app-bar__action-item']}`}>
          reply
        </button>
        <button
          onClick={this.props.deleteMessage}
          className={`material-icons ${mainCss['mdc-top-app-bar__action-item']}`}>
          delete
        </button>
        <button
          onClick={this.props.toggleMessageSeen}
          className={`material-icons ${mainCss['mdc-top-app-bar__action-item']}`}>
          markunread
        </button>
      </Fragment>
    );
  }

  renderMessageListActions() {
    return (
      this.props.selectedMessages.length > 0 ?
        <Fragment>
          <button
            onClick={this.props.deleteMessages}
            className={`material-icons ${mainCss['mdc-top-app-bar__action-item']}`}>
            delete
          </button>
          {this.props.selectedMessagesAllUnread ?
            <button
              onClick={() => this.props.setMessagesSeen(true)}
              className={`material-icons ${mainCss['mdc-top-app-bar__action-item']}`}>
              drafts
            </button> :
            <button
              onClick={() => this.props.setMessagesSeen(false)}
              className={`material-icons ${mainCss['mdc-top-app-bar__action-item']}`}>
              markunread
            </button>
          }
        </Fragment>
        : null
    );
  }
}

TopBar.propTypes = {
  title: PropTypes.string.isRequired,
  newMessage: PropTypes.object,
  selectedFolder: PropTypes.object,
  selectedMessagesIds: PropTypes.array.isRequired,
  selectedMessages: PropTypes.array.isRequired,
  selectedMessage: PropTypes.object,
  selectMessage: PropTypes.func.isRequired,
  selectedMessagesAllUnread: PropTypes.bool.isRequired,
  sideBarToggle: PropTypes.func.isRequired,
  sideBarCollapsed: PropTypes.bool.isRequired
};

const mapStateToProps = state => {
  const selectedMessagesIds = state.messages.selected;
  const messages = state.application.selectedFolderId && state.messages.cache[state.application.selectedFolderId] ?
    Array.from(state.messages.cache[state.application.selectedFolderId].values()) : [];
  const selectedMessages = messages.filter(m => selectedMessagesIds.indexOf(m.uid) > -1);
  const selectedMessagesAllUnread = selectedMessages.filter(m => m.seen === true).length === 0;
  return ({
    title: state.application.title,
    newMessage: state.application.newMessage,
    selectedFolder: state.folders.explodedItems[state.application.selectedFolderId] || null,
    selectedMessagesIds: selectedMessagesIds,
    selectedMessages: selectedMessages,
    selectedMessage: state.application.selectedMessage,
    selectedMessagesAllUnread: selectedMessagesAllUnread,
    credentials: state.application.user.credentials,
    folders: state.folders,
    messages: messages
  });
};

const mapDispatchToProps = dispatch => ({
  selectMessage: message => dispatch(selectMessage(message)),
  replyMessage: selectedMessaage => replyMessage(dispatch, selectedMessaage),
  deleteMessage: (credentials, folders, selectedFolder, selectedMessage) => {
    const trashFolder = _findTrashFolder(folders);
    if (selectedMessage && selectedFolder && trashFolder) {
      moveMessages(dispatch, credentials, selectedFolder, trashFolder, [selectedMessage]);
      dispatch(selectMessage(null));
    }
  },
  toggleMessageSeen: (credentials, selectedFolder, selectedMessage) => {
    setMessagesSeen(dispatch, credentials, selectedFolder, [selectedMessage], !selectedMessage.seen);
    dispatch(selectMessage(null));
  },
  deleteMessages: (credentials, folders, selectedFolder, selectedMessages) => {
    const trashFolder = _findTrashFolder(folders);
    if (selectedMessages.length > 0 && selectedFolder && trashFolder) {
      moveMessages(dispatch, credentials, selectedFolder, trashFolder, selectedMessages);
    }
  },
  setMessagesSeen: (credentials, selectedFolder, selectedMessages, seen) => {
    if (selectedMessages.length > 0 && selectedFolder) {
      setMessagesSeen(dispatch, credentials, selectedFolder, selectedMessages, seen);
    }
  }
});

const mergeProps = (stateProps, dispatchProps, ownProps) => (Object.assign({}, stateProps, dispatchProps, ownProps, {
  replyMessage: () => dispatchProps.replyMessage(stateProps.selectedMessage),
  deleteMessage: () =>
    dispatchProps.deleteMessage(
      stateProps.credentials, stateProps.folders, stateProps.selectedFolder, stateProps.selectedMessage),
  toggleMessageSeen: () =>
    dispatchProps.toggleMessageSeen(
      stateProps.credentials, stateProps.selectedFolder, stateProps.selectedMessage),
  deleteMessages: () =>
    dispatchProps.deleteMessages(
      stateProps.credentials, stateProps.folders, stateProps.selectedFolder, stateProps.selectedMessages),
  setMessagesSeen: seen =>
    dispatchProps.setMessagesSeen(
      stateProps.credentials, stateProps.selectedFolder, stateProps.selectedMessages, seen)
}));

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(TopBar);
