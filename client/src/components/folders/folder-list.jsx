import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import FolderItem from './folder-item';
import styles from './folder-list.scss';
import mainCss from '../../styles/main.scss';

class FolderList extends Component {
  render() {
    return (
      this.props.folderList
        .map(folder =>
          <Fragment key={folder.fullURL}>
            <FolderItem label={folder.name} graphic={folder.type.icon}
              selected={this.props.selectedFolder && folder.folderId === this.props.selectedFolder.folderId}
              onClick={this.props.onClickFolder.bind(this, folder)}
              onDrop={event => this.onDrop(event, folder)}
              unreadMessageCount={folder.unreadMessageCount}
              newMessageCount={folder.newMessageCount}/>
            {(folder.children.length > 0 ?
              <nav className={`${mainCss['mdc-list']} ${styles.childList}`}>
                <FolderList folderList={folder.children}
                  onClickFolder={this.props.onClickFolder}
                  onDropMessages={this.props.onDropMessages}
                  selectedFolder={this.props.selectedFolder} />
              </nav> :
              null
            )}
          </Fragment>
        )
    );
  }

  onDrop(event, toFolder) {
    event.preventDefault();
    const payload = JSON.parse(event.dataTransfer.getData('application/json'));
    this.props.onDropMessages(payload.fromFolder, toFolder, payload.messages);
  }
}


FolderList.propTypes = {
  folderList: PropTypes.array.isRequired,
  selectedFolder: PropTypes.object,
  onClickFolder: PropTypes.func,
  onDropMessages: PropTypes.func
};


FolderList.defaultProps = {
  onClickFolder: () => {},
  onDropMessage: () => {}
};

export default FolderList;
