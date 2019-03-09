import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import Spinner from '../spinner/spinner';
import FolderList from './folder-list';
import FolderCreateDialog from './folder-create-dialog';
import FolderRenameDialog from './folder-rename-dialog';
import {createFolder as createFolderAction} from '../../actions/application';
import styles from './folder-container.scss';
import mainCss from '../../styles/main.scss';

export const FolderContainer = ({activeRequests, folderTree, folders, createFolder}) => {
  const initialListLoading = activeRequests > 0 && folderTree.length === 0;
  return (
    <nav className={`${mainCss['mdc-list']}`}>
      <Spinner visible={initialListLoading}
        canvasClassName={styles.spinnerCanvas} />
      <FolderList folderTree={folderTree} folders={folders}/>
      {!initialListLoading &&
      (<button
        className={`material-icons ${mainCss['mdc-icon-button']} ${styles.addButton}`}onClick={createFolder}>
        add_circle
      </button>)}
      <FolderCreateDialog />
      <FolderRenameDialog />
    </nav>
  );
};

FolderContainer.propTypes = {
  activeRequests: PropTypes.number,
  folderTree: PropTypes.array,
  folders: PropTypes.object,
  createFolder: PropTypes.func
};

const mapStateToProps = state => ({
  activeRequests: state.folders.activeRequests,
  folderTree: state.folders.items,
  folders: state.folders.explodedItems
});

const mapDispatchToProps = dispatch => ({
  createFolder: () => dispatch(createFolderAction(''))
});

export default connect(mapStateToProps, mapDispatchToProps)(FolderContainer);
