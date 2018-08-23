import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import Spinner from '../spinner/spinner';
import {FolderTypes, getFolders} from '../../services/folder';
import FolderList from './folder-list';
import {resetFolderMessagesCache, updateFolderMessagesCache} from '../../services/message';
import {selectFolder} from '../../actions/application';
import styles from './folder-container.scss';
import mainCss from '../../styles/main.scss';

class FolderContainer extends Component {
  constructor(props) {
    super(props);
    this.abortControllerWrapper = {};
  }

  render() {
    return (
      <nav className={`${mainCss['mdc-list']}`}>
        <Spinner visible={this.props.activeRequests > 0 && this.props.folderList.length === 0}
          canvasClassName={styles.spinnerCanvas} />
        <FolderList folderList={this.props.folderList}
          selectedFolder={this.props.selectedFolder}
          onClickFolder={this.props.selectFolder.bind(this, this.abortControllerWrapper)} />
      </nav>
    );
  }

  componentDidMount() {
    this.props.resetFolders();
    this.loadInbox();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    this.loadInbox();
  }

  loadInbox() {
    // Initial list of folders loaded -> Select INBOX
    if (this.props.folderList && this.props.folderList.length > 0 && !this.props.selectedFolder.folderId) {
      const inbox = this.props.folderList.find(f => f.type === FolderTypes.INBOX);
      if (inbox) {
        this.props.selectFolder(this.abortControllerWrapper, inbox);
      }
    }
  }
}

FolderContainer.propTypes = {
  activeRequests: PropTypes.number.isRequired,
  folderList: PropTypes.array.isRequired,
  resetFolders: PropTypes.func,
  selectFolder: PropTypes.func
};

const mapStateToProps = state => ({
  application: state.application,
  activeRequests: state.folders.activeRequests,
  selectedFolder: state.application.selectedFolder,
  folderList: state.folders.items,
  messages: state.messages
});

const mapDispatchToProps = dispatch => ({
  resetFolders: credentials => {
    getFolders(dispatch, credentials, true);
  },
  selectFolder: (abortControllerWrapper, folder, credentials, cachedFolderMessagesMap) => {
    dispatch(selectFolder(folder));
    if (abortControllerWrapper && abortControllerWrapper.abortController) {
      abortControllerWrapper.abortController.abort();
    }
    abortControllerWrapper.abortController = new AbortController();
    // Performance: Perform an initial load of the latest (30*) messages in the folder
    const initialLoadMessageCount = 30;
    if (cachedFolderMessagesMap instanceof Map === false
      && folder.messageCount >= initialLoadMessageCount) {
      updateFolderMessagesCache(dispatch, credentials, folder, abortControllerWrapper.abortController.signal,
        folder.messageCount - initialLoadMessageCount, folder.messageCount);
    }
    resetFolderMessagesCache(dispatch, credentials, folder, abortControllerWrapper.abortController.signal);
  }
});

const mergeProps = (stateProps, dispatchProps, ownProps) => (Object.assign({}, stateProps, dispatchProps, ownProps, {
  resetFolders: () => dispatchProps.resetFolders(stateProps.application.user.credentials),
  selectFolder: (abortControllerWrapper, folder) =>
    dispatchProps.selectFolder(abortControllerWrapper, folder, stateProps.application.user.credentials,
      stateProps.messages.cache[folder.folderId])
}));

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(FolderContainer);
