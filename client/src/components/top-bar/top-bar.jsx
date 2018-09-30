import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {FolderTypes} from '../../services/folder';
import {selectMessage} from '../../actions/application';
import {moveMessages, setMessageSeen} from '../../services/message';
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
            {isMessageViewer ?
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
          <section className={`${mainCss['mdc-top-app-bar__section']} ${mainCss['mdc-top-app-bar__section--align-end']}`}>
            {isMessageViewer ? this.renderMessageViewerActions() : this.renderMessageListActions()}
          </section>
        </div>
      </header>
    );
  }

  renderMessageViewerActions() {
    return (
      <Fragment>
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
      <Fragment>
        {this.props.selectedMessagesIds.length > 0 ?
          <button
            onClick={this.props.deleteMessages}
            className={`material-icons ${mainCss['mdc-top-app-bar__action-item']}`}>
            delete
          </button>
          : null}
      </Fragment>
    );
  }
}

TopBar.propTypes = {
  title: PropTypes.string.isRequired,
  selectedFolder: PropTypes.object,
  selectedMessagesIds: PropTypes.array,
  selectMessage: PropTypes.func.isRequired,
  sideBarToggle: PropTypes.func.isRequired,
  sideBarCollapsed: PropTypes.bool.isRequired
};

const mapStateToProps = state => ({
  title: state.application.title,
  selectedFolder: state.folders.explodedItems[state.application.selectedFolderId] || null,
  selectedMessagesIds: state.messages.selected,
  selectedMessage: state.application.selectedMessage,
  credentials: state.application.user.credentials,
  folders: state.folders,
  messages: state.application.selectedFolderId && state.messages.cache[state.application.selectedFolderId] ?
    Array.from(state.messages.cache[state.application.selectedFolderId].values()) : []
});

const mapDispatchToProps = dispatch => ({
  selectMessage: message => dispatch(selectMessage(message)),
  deleteMessage: (credentials, folders, selectedFolder, selectedMessage) => {
    const trashFolder = _findTrashFolder(folders);
    if (selectedMessage && selectedFolder && trashFolder) {
      moveMessages(dispatch, credentials, selectedFolder, trashFolder, [selectedMessage]);
      dispatch(selectMessage(null));
    }
  },
  deleteMessages: (credentials, folders, selectedFolder, selectedMessagesIds, messages) => {
    const trashFolder = _findTrashFolder(folders);
    if (selectedMessagesIds && selectedMessagesIds.length > 0 && selectedFolder && trashFolder) {
      const selectedMessages = messages.filter(m => selectedMessagesIds.indexOf(m.uid) > -1);
      moveMessages(dispatch, credentials, selectedFolder, trashFolder, selectedMessages);
    }
  },
  toggleMessageSeen: (credentials, selectedFolder, selectedMessage) => {
    setMessageSeen(dispatch, credentials, selectedFolder, selectedMessage, !selectedMessage.seen);
    dispatch(selectMessage(null));
  }
});

const mergeProps = (stateProps, dispatchProps, ownProps) => (Object.assign({}, stateProps, dispatchProps, ownProps, {
  deleteMessage: () =>
    dispatchProps.deleteMessage(
      stateProps.credentials, stateProps.folders, stateProps.selectedFolder, stateProps.selectedMessage),
  deleteMessages: () =>
    dispatchProps.deleteMessages(
      stateProps.credentials, stateProps.folders, stateProps.selectedFolder, stateProps.selectedMessagesIds,
      stateProps.messages),
  toggleMessageSeen: () =>
    dispatchProps.toggleMessageSeen(
      stateProps.credentials, stateProps.selectedFolder, stateProps.selectedMessage)
}));

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(TopBar);
