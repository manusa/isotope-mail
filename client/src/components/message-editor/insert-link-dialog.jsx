import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Dialog from '../dialog/dialog';
import TextField from '../form/text-field/text-field';
import {translate} from 'react-i18next';
import mainCss from '../../styles/main.scss';

export class InsertLinkDialog extends Component {
  constructor(props) {
    super(props);
    this.handleTextfieldKeyDown = this.textfieldKeyDown.bind(this);
  }

  render() {
    const {t, visible, insertLink, closeDialog, onChange, url} = this.props;
    const actions = [
      {label: t('messageEditor.insertLinkDialog.cancel'), action: closeDialog},
      {label: t('messageEditor.insertLinkDialog.ok'), action: insertLink}
    ];
    return (
      <Dialog
        visible={visible}
        title={t('messageEditor.insertLinkDialog.title')}
        actions={actions}
        scrimClick={closeDialog}
      >
        <form>
          <TextField
            id={'link'} focused={true} type={'text'} value={url}
            fieldClass={mainCss['mdc-text-field--fullwidth']}
            onChange={onChange} onKeyDown={this.handleTextfieldKeyDown}
          />
        </form>
      </Dialog>
    );
  }

  textfieldKeyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.props.insertLink();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.props.closeDialog();
    }
  }
}

InsertLinkDialog.propTypes = {
  visible: PropTypes.bool,
  closeDialog: PropTypes.func.isRequired,
  insertLink: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  url: PropTypes.string.isRequired
};

InsertLinkDialog.defaultProps = {
  visible: false
};

export default (translate()(InsertLinkDialog));
