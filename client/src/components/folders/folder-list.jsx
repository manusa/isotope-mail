import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import FolderItem from './folder-item';
import {FolderTypes} from '../../services/folder';
import styles from './folder-list.scss';
import mainCss from '../../styles/main.scss';

class FolderList extends Component {
  render() {
    const {folderList, selectedFolder} = this.props;
    return (
      folderList.map(folder =>
        <Fragment key={folder.fullURL}>
          <FolderItem label={folder.name} graphic={folder.type.icon}
            selected={selectedFolder && folder.folderId === selectedFolder.folderId}
            onClick={event => this.onClick(event, folder)}
            onDrop={event => this.onDrop(event, folder)}
            onRename={FolderTypes.INBOX === folder.type ? null : event => this.onRename(event, folder)}
            unreadMessageCount={folder.unreadMessageCount}
            newMessageCount={folder.newMessageCount}/>
          {(folder.children.length > 0 ?
            <nav className={`${mainCss['mdc-list']} ${styles.childList}`}>
              <FolderList folderList={folder.children}
                onClickFolder={this.props.onClickFolder}
                onRenameFolder={this.props.onRenameFolder}
                onDropMessages={this.props.onDropMessages}
                selectedFolder={this.props.selectedFolder} />
            </nav> :
            null
          )}
        </Fragment>
      )
    );
  }

  onClick(event, folder) {
    event.stopPropagation();
    this.props.onClickFolder(folder);
  }

  onDrop(event, toFolder) {
    event.preventDefault();
    const payload = JSON.parse(event.dataTransfer.getData('application/json'));
    this.props.onDropMessages(payload.fromFolder, toFolder, payload.messages);
  }

  onRename(event, folder) {
    event.stopPropagation();
    this.props.onRenameFolder(folder);
  }
}


FolderList.propTypes = {
  folderList: PropTypes.array.isRequired,
  selectedFolder: PropTypes.object,
  onClickFolder: PropTypes.func,
  onRenameFolder: PropTypes.func,
  onDropMessages: PropTypes.func
};


FolderList.defaultProps = {
  onClickFolder: () => {},
  onRenameFolder: () => {},
  onDropMessage: () => {}
};

export default FolderList;
