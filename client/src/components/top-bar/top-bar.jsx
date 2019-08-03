import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import ConfirmDeleteFromTrashDialog from './confirm-delete-from-trash-dialog';
import TopBarMessageList from './top-bar-message-list';
import TopBarMessageViewer from './top-bar-message-viewer';
import TopBarMessageEditor from './top-bar-message-editor';
import {getCredentials, selectedMessage as selectedMessageSelector} from '../../selectors/application';
import {getSelectedFolder} from '../../selectors/folders';
import {selectedFolderMessagesFilteredAndSelected, selectedMessagesIds} from '../../selectors/messages';
import {findTrashFolder, FolderTypes} from '../../services/folder';
import {forwardMessage, replyAllMessage, clearSelectedMessage} from '../../services/application';
import {deleteMessages, moveMessages, setMessagesSeen} from '../../services/message';
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
    const props = this.props;
    const {sideBarToggle, selectedMessages, selectedMessagesAllUnread, outbox, toggleMessageSeen} = props;
    const collapsed = props.sideBarCollapsed;
    const isEditing = props.newMessage && Object.keys(props.newMessage).length > 0;
    const isMessageViewer = props.selectedMessage && Object.keys(props.selectedMessage).length > 0;
    let title = props.title;
    if (props.selectedFolder && props.selectedFolder.name
      && props.selectedFolder.type !== FolderTypes.INBOX) {
      title = `${props.selectedFolder.name} - ${title}`;
    }
    return (
      <header className={`
      ${mainCss['mdc-top-app-bar']} ${mainCss['mdc-top-app-bar--fixed']}`}>
        {!isEditing && !isMessageViewer
          && (<TopBarMessageList
            title={title} collapsed={collapsed} sideBarToggle={sideBarToggle}
            selectedMessages={selectedMessages}
            onDeleteClick={() => this.onDelete(props.deleteMessages)}
            selectedMessagesAllUnread={selectedMessagesAllUnread}
            onMarkReadClick={() => props.setMessagesSeen(true)}
            onMarkUnreadClick={() => props.setMessagesSeen(false)}
          />)
        }
        {!isEditing && isMessageViewer
          && (<TopBarMessageViewer
            collapsed={collapsed} sideBarToggle={sideBarToggle} clearSelectedMessage={props.clearSelectedMessage}
            outboxEmpty={outbox === null}
            onReplyAllMessageClick={props.replyAllMessage} onForwardMessageClick={props.forwardMessage}
            onDeleteClick={() => this.onDelete(props.deleteMessage)} onMarkUnreadClick={toggleMessageSeen}/>)
        }
        {isEditing
          && (<TopBarMessageEditor
            title={title} collapsed={collapsed} sideBarToggle={sideBarToggle}
          />)
        }
        <ConfirmDeleteFromTrashDialog
          visible={this.state.deletingFromTrash}
          deleteAction={this.state.deletingFromTrashConfirm}
          cancelAction={() => this.setState({deletingFromTrash: false})}
        />
      </header>
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
  const selectedMessages = selectedFolderMessagesFilteredAndSelected(state);
  const selectedMessagesAllUnread = selectedMessages.filter(m => m.seen === true).length === 0;
  return ({
    title: state.application.title,
    newMessage: state.application.newMessage,
    outbox: state.application.outbox,
    selectedFolder: getSelectedFolder(state) || null,
    selectedMessagesIds: selectedMessagesIds(state),
    selectedMessages: selectedMessages,
    selectedMessage: selectedMessageSelector(state),
    selectedMessagesAllUnread: selectedMessagesAllUnread,
    credentials: getCredentials(state),
    folders: state.folders
  });
};

const mapDispatchToProps = dispatch => ({
  clearSelectedMessage: () => clearSelectedMessage(dispatch),
  replyAllMessage: replyAllMessage(dispatch),
  forwardMessage: selectedMessage => forwardMessage(dispatch, selectedMessage),
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
  replyAllMessage: () => dispatchProps.replyAllMessage(stateProps.selectedMessage),
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
