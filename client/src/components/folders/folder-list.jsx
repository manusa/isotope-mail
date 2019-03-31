import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import FolderItem from './folder-item';
import {createFolder as createFolderAction, renameFolder, selectFolder} from '../../actions/application';
import {clearSelected} from '../../actions/messages';
import {clearSelectedMessage} from '../../services/application';
import {deleteFolder, findTrashFolder, FolderTypes, moveFolder} from '../../services/folder';
import {moveMessages, resetFolderMessagesCache} from '../../services/message';
import {getSelectedFolder} from '../../selectors/folders';
import styles from './folder-list.scss';
import mainCss from '../../styles/main.scss';

export const DroppablePayloadTypes = {
  FOLDER: 'FOLDER',
  MESSAGES: 'MESSAGES'
};

export class FolderListClass extends Component {
  render() {
    const {folderTree, folders, selectedFolder} = this.props;
    return (
      folderTree.map(folderReference => {
        const folder = folders[folderReference.folderId];
        return <div key={folder.fullURL} className={`${styles.itemContainer}`}>
          <FolderItem
            label={folder.name} graphic={folder.type.icon}
            className={styles.item}
            selected={selectedFolder && folder.folderId === selectedFolder.folderId}
            onClick={event => this.onClick(event, folder)}
            draggable={FolderTypes.FOLDER === folder.type}
            onDragStart={event => FolderListClass.onDragStart(event, folder)}
            onDrop={event => this.onDrop(event, folder)}
            onRename={FolderTypes.INBOX === folder.type ? null : event => this.onRename(event, folder)}
            onAddChild={event => this.onAddChild(event, folder)}
            onDelete={FolderTypes.FOLDER === folder.type ? event => this.onDelete(event, folder) : null}
            unreadMessageCount={folder.unreadMessageCount}
            newMessageCount={folder.newMessageCount}/>
          {(folderReference.children.length > 0 ?
            <nav className={`${mainCss['mdc-list']} ${styles.childList}`}>
              <FolderList folderTree={folderReference.children} folders={folders}/>
            </nav> :
            null
          )}
        </div>;
      })
    );
  }

  onClick(event, folder) {
    event.stopPropagation();
    this.props.selectFolder(folder);
  }

  static onDragStart(event, folder) {
    const payload = {type: DroppablePayloadTypes.FOLDER, folder};
    event.dataTransfer.setData('application/json', JSON.stringify(payload));
  }

  onDrop(event, toFolder) {
    if (event.dataTransfer.types && Array.from(event.dataTransfer.types).includes('application/json')) {
      const payload = JSON.parse(event.dataTransfer.getData('application/json'));
      switch (payload.type) {
        case DroppablePayloadTypes.FOLDER: {
          const folderToMoveId = payload.folder.folderId;
          if (folderToMoveId !== toFolder.folderId && !toFolder.children.some(f => f.folderId === folderToMoveId)) {
            this.props.moveFolder(payload.folder, toFolder);
          }
          break;
        }
        case DroppablePayloadTypes.MESSAGES:
          this.props.moveMessages(payload.fromFolder, toFolder, payload.messages);
          break;
        default:
      }
    }
  }

  onRename(event, folder) {
    event.stopPropagation();
    this.props.renameFolder(folder);
  }

  onAddChild(event, folder) {
    event.stopPropagation();
    this.props.createChildInFolder(folder);
  }

  onDelete(event, folder) {
    event.stopPropagation();
    const trashFolder = findTrashFolder(this.props.foldersState);
    if (!folder || !trashFolder) {
      return;
    }
    if (!trashFolder.children.map(f => f.folderId).includes(folder.folderId)) {
      this.props.moveFolder(folder, trashFolder);
    } else {
      this.props.deleteFolder(folder);
    }
  }
}


FolderListClass.propTypes = {
  folderTree: PropTypes.array.isRequired,
  folders: PropTypes.object.isRequired,
  application: PropTypes.object,
  selectedFolder: PropTypes.object,
  foldersState: PropTypes.object,
  selectFolder: PropTypes.func,
  renameFolder: PropTypes.func,
  moveMessages: PropTypes.func
};


FolderListClass.defaultProps = {
};

const mapStateToProps = state => ({
  application: state.application,
  selectedFolder: getSelectedFolder(state) || {},
  foldersState: state.folders,
  messages: state.messages
});

const mapDispatchToProps = dispatch => ({
  selectFolder: (folder, user) => {
    dispatch(selectFolder(folder));
    clearSelectedMessage(dispatch);
    dispatch(clearSelected());
    resetFolderMessagesCache(dispatch, user, folder);
  },
  renameFolder: folder => dispatch(renameFolder(folder)),
  createChildInFolder: folder => dispatch(createFolderAction(folder.folderId)),
  moveFolder: (user, folder, targetFolder) => moveFolder(dispatch, user, folder, targetFolder),
  deleteFolder: (user, folder) => deleteFolder(dispatch, user, folder),
  moveMessages: (credentials, fromFolder, toFolder, messages) => {
    moveMessages(dispatch, credentials, fromFolder, toFolder, messages);
  }
});

const mergeProps = (stateProps, dispatchProps, ownProps) => (Object.assign({}, stateProps, dispatchProps, ownProps, {
  selectFolder: folder =>
    dispatchProps.selectFolder(folder, stateProps.application.user),
  moveFolder: (folder, targetFolder) => dispatchProps.moveFolder(stateProps.application.user, folder, targetFolder),
  deleteFolder: folder => dispatchProps.deleteFolder(stateProps.application.user, folder),
  moveMessages: (fromFolder, toFolder, message) => dispatchProps.moveMessages(stateProps.application.user.credentials,
    fromFolder, toFolder, message)
}));

const FolderList = connect(mapStateToProps, mapDispatchToProps, mergeProps)(FolderListClass);
export default FolderList;
