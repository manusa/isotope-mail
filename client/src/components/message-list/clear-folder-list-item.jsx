import React, {useState} from 'react';
import {connect} from 'react-redux';
import {translate} from 'react-i18next';
import Button from '../buttons/button';
import ConfirmClearFolderDialog from './confirm-clear-folder-dialog';
import {getCredentials} from '../../selectors/application';
import {getSelectedFolder} from '../../selectors/folders';
import {FolderTypes} from '../../services/folder';
import {deleteAllFolderMessages} from '../../services/message';
import styles from './message-list.scss';

const isVisible = selectedFolder => [FolderTypes.TRASH, FolderTypes.JUNK].includes(selectedFolder.type);

export const ClearFolderListItem = ({t, selectedFolder, clearFolder}) => {
  const [dialogVisible, setDialogVisible] = useState(false);
  return (isVisible(selectedFolder) && (
    <div className={styles.clearFolderListItem}>
      <Button
        className={styles.emptyFolder}
        label={t('messageList.emptyFolder')} icon={'delete'}
        onClick={() => setDialogVisible(true)}
      />
      <ConfirmClearFolderDialog
        visible={dialogVisible}
        cancelAction={() => setDialogVisible(false)}
        deleteAction={() => clearFolder()}
      />
    </div>
  ));
};

const mapStateToProps = state => ({
  credentials: getCredentials(state),
  selectedFolder: getSelectedFolder(state) || {}
});

const mapDispatchToProps = dispatch => ({
  clearFolder: (credentials, folder) => deleteAllFolderMessages(dispatch, credentials, folder)
});

const mergeProps = (stateProps, dispatchProps, ownProps) => (Object.assign({}, stateProps, dispatchProps, ownProps, {
  clearFolder: () => dispatchProps.clearFolder(stateProps.credentials, stateProps.selectedFolder)
}));

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(translate()(ClearFolderListItem));
