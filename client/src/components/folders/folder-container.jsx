import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import Spinner from '../spinner/spinner';
import FolderList from './folder-list';
import FolderRenameDialog from './folder-rename-dialog';
import {moveMessages, resetFolderMessagesCache} from '../../services/message';
import {renameFolder, selectFolder, selectMessage} from '../../actions/application';
import {clearSelected} from '../../actions/messages';
import styles from './folder-container.scss';
import mainCss from '../../styles/main.scss';

export class FolderContainer extends Component {
  render() {
    return (
      <nav className={`${mainCss['mdc-list']}`}>
        <Spinner visible={this.props.activeRequests > 0 && this.props.folderList.length === 0}
          canvasClassName={styles.spinnerCanvas} />
        <FolderList folderList={this.props.folderList}
          selectedFolder={this.props.selectedFolder}
          onClickFolder={this.props.selectFolder}
          onRenameFolder={this.props.renameFolder}
          onDropMessages={this.props.moveMessages}
        />
        <FolderRenameDialog />
      </nav>
    );
  }
}

FolderContainer.propTypes = {
  activeRequests: PropTypes.number.isRequired,
  folderList: PropTypes.array.isRequired,
  selectedFolder: PropTypes.object
};

const mapStateToProps = state => ({
  application: state.application,
  activeRequests: state.folders.activeRequests,
  selectedFolder: state.folders.explodedItems[state.application.selectedFolderId] || {},
  folderList: state.folders.items,
  messages: state.messages
});

const mapDispatchToProps = dispatch => ({
  selectFolder: (folder, credentials) => {
    dispatch(selectFolder(folder));
    dispatch(selectMessage(null));
    dispatch(clearSelected());
    resetFolderMessagesCache(dispatch, credentials, folder);
  },
  renameFolder: folder => dispatch(renameFolder(folder)),
  moveMessages: (credentials, fromFolder, toFolder, messages) => {
    moveMessages(dispatch, credentials, fromFolder, toFolder, messages);
  }
});

const mergeProps = (stateProps, dispatchProps, ownProps) => (Object.assign({}, stateProps, dispatchProps, ownProps, {
  selectFolder: folder =>
    dispatchProps.selectFolder(folder, stateProps.application.user.credentials),
  moveMessages: (fromFolder, toFolder, message) => dispatchProps.moveMessages(stateProps.application.user.credentials,
    fromFolder, toFolder, message)
}));

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(FolderContainer);
