import React from 'react';
import PropTypes from 'prop-types';
import {translate} from 'react-i18next';
import Dialog from '../dialog/dialog';

export const ConfirmClearFolderDialog = ({t, visible, cancelAction, deleteAction}) => {
  const actions = [
    {label: t('messageList.clearFolderDialog.cancel'), action: cancelAction},
    {label: t('messageList.clearFolderDialog.deleteAll'), action: deleteAction}
  ];
  return (
    <Dialog
      visible={visible}
      title={t('messageList.clearFolderDialog.title')}
      actions={actions}
    >
      <p>{t('messageList.clearFolderDialog.message')}</p>
    </Dialog>
  );
};

ConfirmClearFolderDialog.propTypes = {
  visible: PropTypes.bool.isRequired,
  cancelAction: PropTypes.func.isRequired,
  deleteAction: PropTypes.func.isRequired
};

export default translate()(ConfirmClearFolderDialog);
