import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {translate} from 'react-i18next';
import SingleInputDialog from '../dialog/single-input-dialog';
import {renameFolder as actionRenameFolder} from '../../actions/application';
import {renameFolder as serviceRenameFolder} from '../../services/folder';

export const FolderRenameDialog = ({t, folderToRename, cancel, renameFolder, application}) => {
  const visible = folderToRename !== null;
  const disabled = application.activeRequests > 0;
  const folderName = folderToRename ? folderToRename.name : '';
  const renameFolderAction = newName => renameFolder(folderToRename, newName);
  return (
    <SingleInputDialog
      visible={visible} disabled={disabled}
      titleLabel={t('renameFolderDialog.title')}
      messageLabel={t('renameFolderDialog.message', {folderName: folderName})}
      inputLabel={t('renameFolderDialog.folderNameLabel')} inputValue={folderName}
      cancelLabel={t('renameFolderDialog.cancel')} cancelAction={cancel}
      okLabel={t('renameFolderDialog.rename')} okAction={renameFolderAction}/>
  );
};

FolderRenameDialog.propTypes = {
  application: PropTypes.object,
  folderToRename: PropTypes.object,
  cancel: PropTypes.func,
  renameFolder: PropTypes.func
};

FolderRenameDialog.defaultProps = {
};

const mapStateToProps = state => ({
  application: state.application,
  folderToRename: state.folders.explodedItems[state.application.renameFolderId] || null
});

const mapDispatchToProps = dispatch => ({
  cancel: () => dispatch(actionRenameFolder(null)),
  renameFolder: (user, folderToRename, newName) =>
    serviceRenameFolder(dispatch, user, folderToRename, newName)
});

const mergeProps = (stateProps, dispatchProps, ownProps) => (Object.assign({}, stateProps, dispatchProps, ownProps, {
  renameFolder: (folderToRename, newName) =>
    dispatchProps.renameFolder(stateProps.application.user, folderToRename, newName)
}));

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(translate()(FolderRenameDialog));
