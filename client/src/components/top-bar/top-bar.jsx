import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import ConfirmDeleteFromTrashDialog from './confirm-delete-from-trash-dialog';
import {findTrashFolder, FolderTypes} from '../../services/folder';
import {forwardMessage, replyMessage, clearSelectedMessage} from '../../services/application';
import {deleteMessages, moveMessages, setMessagesSeen} from '../../services/message';
import styles from './top-bar.scss';
import mainCss from '../../styles/main.scss';

export class TopBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      deletingFromTrash: false,
      deletingFromTrashConfirm: () => {}
    };
  }

  render() {
    const collapsed = this.props.sideBarCollapsed;
    const isEditing = this.props.newMessage && Object.keys(this.props.newMessage).length > 0;
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
                <button onClick={this.props.clearSelectedMessage}
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
        <ConfirmDeleteFromTrashDialog
          visible={this.state.deletingFromTrash}
          deleteAction={this.state.deletingFromTrashConfirm}
          cancelAction={() => this.setState({deletingFromTrash: false})}
        />
      </header>
    );
  }

  renderMessageViewerActions() {
    const {outbox, toggleMessageSeen} = this.props;
    return (
      <Fragment>
        {outbox === null &&
          <button
            onClick={this.props.replyMessage}
            className={`material-icons ${mainCss['mdc-top-app-bar__action-item']}`}>
            reply_all
          </button>}
        {outbox === null &&
        <button
          onClick={this.props.forwardMessage}
          className={`material-icons ${mainCss['mdc-top-app-bar__action-item']}`}>
          forward
        </button>}
        <button
          onClick={() => this.onDelete(this.props.deleteMessage)}
          className={`material-icons ${mainCss['mdc-top-app-bar__action-item']}`}>
          delete
        </button>
        <button
          onClick={toggleMessageSeen}
          className={`material-icons ${mainCss['mdc-top-app-bar__action-item']}`}>
          markunread
        </button>
      </Fragment>
    );
  }

  renderMessageListActions() {
    return (
      this.props.selectedMessages.length > 0 &&
        <Fragment>
          <button
            onClick={() => this.onDelete(this.props.deleteMessages)}
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
    );
  }

  onDelete(action) {
    if (this.props.selectedFolder.type === FolderTypes.TRASH) {
      this.setState({
        deletingFromTrash: true,
        deletingFromTrashConfirm: () => {
          action();
          this.setState({deletingFromTrash: false});
        }
      });
    } else {
      action();
    }
  }
}

TopBar.propTypes = {
  title: PropTypes.string,
  newMessage: PropTypes.object,
  selectedFolder: PropTypes.object,
  selectedMessagesIds: PropTypes.array,
  selectedMessages: PropTypes.array,
  selectedMessage: PropTypes.object,
  selectedMessagesAllUnread: PropTypes.bool,
  clearSelectedMessage: PropTypes.func,
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
    outbox: state.application.outbox,
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
  clearSelectedMessage: () => clearSelectedMessage(dispatch),
  replyMessage: selectedMessaage => replyMessage(dispatch, selectedMessaage),
  forwardMessage: selectedMessaage => forwardMessage(dispatch, selectedMessaage),
  deleteMessage: (credentials, folders, selectedFolder, selectedMessage) => {
    const trashFolder = findTrashFolder(folders);
    if (selectedMessage && selectedFolder && trashFolder) {
      if (selectedFolder === trashFolder) {
        deleteMessages(dispatch, credentials, selectedFolder, [selectedMessage]);
      } else {
        moveMessages(dispatch, credentials, selectedFolder, trashFolder, [selectedMessage]);
      }
      clearSelectedMessage(dispatch);
    }
  },
  toggleMessageSeen: (credentials, selectedFolder, selectedMessage) => {
    setMessagesSeen(dispatch, credentials, selectedFolder, [selectedMessage], !selectedMessage.seen);
    clearSelectedMessage(dispatch);
  },
  deleteMessages: (credentials, folders, selectedFolder, selectedMessages) => {
    const trashFolder = findTrashFolder(folders);
    if (selectedMessages.length > 0 && selectedFolder && trashFolder) {
      if (selectedFolder === trashFolder) {
        deleteMessages(dispatch, credentials, selectedFolder, selectedMessages);
      } else {
        moveMessages(dispatch, credentials, selectedFolder, trashFolder, selectedMessages);
      }
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
  forwardMessage: () => dispatchProps.forwardMessage(stateProps.selectedMessage),
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
