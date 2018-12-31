import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import Spinner from '../spinner/spinner';
import FolderList from './folder-list';
import FolderRenameDialog from './folder-rename-dialog';
import styles from './folder-container.scss';
import mainCss from '../../styles/main.scss';

export const FolderContainer =
  ({activeRequests, folderList}) => (
    <nav className={`${mainCss['mdc-list']}`}>
      <Spinner visible={activeRequests > 0 && folderList.length === 0}
        canvasClassName={styles.spinnerCanvas} />
      <FolderList folderList={folderList}/>
      <FolderRenameDialog />
    </nav>
  );

FolderContainer.propTypes = {
  activeRequests: PropTypes.number.isRequired,
  folderList: PropTypes.array.isRequired
};

const mapStateToProps = state => ({
  activeRequests: state.folders.activeRequests,
  folderList: state.folders.items
});

export default connect(mapStateToProps)(FolderContainer);
