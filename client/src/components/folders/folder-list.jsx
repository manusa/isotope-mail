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
              unreadMessageCount={folder.unreadMessageCount}
              newMessageCount={folder.newMessageCount}/>
            {(folder.children.length > 0 ?
              <nav className={`${mainCss['mdc-list']} ${styles.childList}`}>
                <FolderList folderList={folder.children} onClickFolder={this.props.onClickFolder}
                  selectedFolder={this.props.selectedFolder} />
              </nav> :
              null
            )}
          </Fragment>
        )
    );
  }
}


FolderList.propTypes = {
  folderList: PropTypes.array.isRequired,
  selectedFolder: PropTypes.object,
  onClickFolder: PropTypes.func
};


FolderList.defaultProps = {
  onClickFolder: () => {}
};

export default FolderList;
