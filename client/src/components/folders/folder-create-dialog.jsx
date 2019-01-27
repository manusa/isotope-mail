import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {translate} from 'react-i18next';
import SingleInputDialog from '../dialog/single-input-dialog';
import {createFolder as actionCreateFolder} from '../../actions/application';
import {createChildFolder, createRootFolder} from '../../services/folder';

export const FolderCreateDialog = ({t, application, cancel, createFolder}) => {
  const visible = Object.keys(application).includes('createFolderParentId') && application.createFolderParentId !== null;
  const disabled = application.activeRequests > 0;
  const inputValue = visible ? '' : null; // Resets the input field when dialog is closed
  return (
    <SingleInputDialog
      visible={visible} disabled={disabled}
      titleLabel={t('createFolderDialog.title')} messageLabel={t('createFolderDialog.message')}
      inputLabel={t('createFolderDialog.folderNameLabel')} inputValue={inputValue}
      cancelLabel={t('createFolderDialog.cancel')} cancelAction={cancel}
      okLabel={t('createFolderDialog.create')} okAction={createFolder}/>
  );
};

FolderCreateDialog.propTypes = {
  application: PropTypes.object,
  cancel: PropTypes.func,
  createFolder: PropTypes.func
};

FolderCreateDialog.defaultProps = {
};

const mapStateToProps = state => ({
  application: state.application,
  folders: state.folders
});

const mapDispatchToProps = dispatch => ({
  cancel: () => dispatch(actionCreateFolder(null)),
  createRootFolder: (user, newFolderName) => createRootFolder(dispatch, user, newFolderName),
  createChildFolder: (user, parentFolder, newFolderName) =>
    createChildFolder(dispatch, user, parentFolder, newFolderName)
});

const mergeProps = (stateProps, dispatchProps, ownProps) => (Object.assign({}, stateProps, dispatchProps, ownProps, {
  createFolder: newFolderName => {
    const folderParentId = stateProps.application.createFolderParentId;
    if (folderParentId.length > 0 && stateProps.folders.explodedItems[folderParentId]) {
      dispatchProps.createChildFolder(
        stateProps.application.user, stateProps.folders.explodedItems[folderParentId], newFolderName);
    } else {
      dispatchProps.createRootFolder(stateProps.application.user, newFolderName);
    }
  }
}));

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(translate()(FolderCreateDialog));
