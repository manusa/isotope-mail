import React from 'react';
import PropTypes from 'prop-types';
import {translate} from 'react-i18next';
import Dialog from '../dialog/dialog';

export const ConfirmDeleteFromTrashDialog = ({t, visible, cancelAction, deleteAction}) => {
  const actions = [
    {label: t('topBar.deleteFromTrashDialog.cancel'), action: cancelAction},
    {label: t('topBar.deleteFromTrashDialog.delete'), action: deleteAction}
  ];
  return (
    <Dialog
      visible={visible}
      title={t('topBar.deleteFromTrashDialog.title')}
      actions={actions}
    >
      <p>{t('topBar.deleteFromTrashDialog.message')}</p>
    </Dialog>
  );
};

ConfirmDeleteFromTrashDialog.propTypes = {
  visible: PropTypes.bool.isRequired,
  cancelAction: PropTypes.func.isRequired,
  deleteAction: PropTypes.func.isRequired
};

export default (translate()(ConfirmDeleteFromTrashDialog));
