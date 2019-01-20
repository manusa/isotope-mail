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

export const FolderContainer =
  ({activeRequests, folderList, createFolder}) => (
    <nav className={`${mainCss['mdc-list']}`}>
      <Spinner visible={activeRequests > 0 && folderList.length === 0}
        canvasClassName={styles.spinnerCanvas} />
      <FolderList folderList={folderList}/>
      <button className={`material-icons ${mainCss['mdc-icon-button']} ${styles.addButton}`} onClick={createFolder}>add_circle</button>
      <FolderCreateDialog />
      <FolderRenameDialog />
    </nav>
  );

FolderContainer.propTypes = {
  activeRequests: PropTypes.number,
  folderList: PropTypes.array,
  createFolder: PropTypes.func
};

const mapStateToProps = state => ({
  activeRequests: state.folders.activeRequests,
  folderList: state.folders.items
});

const mapDispatchToProps = dispatch => ({
  createFolder: () => dispatch(createFolderAction(''))
});

export default connect(mapStateToProps, mapDispatchToProps)(FolderContainer);
