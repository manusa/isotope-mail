import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Dialog from '../dialog/dialog';
import TextField from '../form/text-field/text-field';
import styles from './single-input-dialog.scss';
import mainCss from '../../styles/main.scss';

class SingleInputDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: this.props.inputValue
    };
    this.formRef = React.createRef();
    this.handleValidatedOkAction = this.validatedOkAction.bind(this);
    this.handleTextfieldKeyDown = this.textfieldKeyDown.bind(this);
  }

  render() {
    const {visible, disabled, titleLabel, messageLabel, inputLabel, cancelLabel, cancelAction, okLabel} = this.props;
    const actions = [
      {label: cancelLabel, disabled, action: cancelAction},
      {label: okLabel, disabled, action: this.handleValidatedOkAction}
    ];
    return (
      <Dialog
        visible={visible}
        className={styles.singleInputDialog}
        containerClassName={styles.container}
        contentClassName={styles.content}
        title={titleLabel}
        actions={actions}
      >
        <span>{messageLabel}</span>
        <form ref={this.formRef} onSubmit={this.handleValidatedOkAction}>
          <TextField id={'folderName'} focused={true} type={'text'} fieldClass={mainCss['mdc-text-field--fullwidth']}
            disabled={disabled}
            label={inputLabel} value={this.state.value} required={true}
            onChange={e => this.setState({value: e.target.value})} onKeyDown={this.handleTextfieldKeyDown}
          />
        </form>
      </Dialog>
    );
  }

  componentWillUpdate(nextProps) {
    if (nextProps.inputValue === '' || nextProps.inputValue) {
      if (this.props.inputValue === null || nextProps.inputValue !== this.props.inputValue) {
        this.setState({
          value: nextProps.inputValue
        });
      }
    }
  }

  validatedOkAction() {
    if (this.formRef.current.reportValidity()) {
      this.props.okAction(this.state.value);
    }
  }

  textfieldKeyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.validatedOkAction();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.props.cancelAction();
    }
  }
}

SingleInputDialog.propTypes = {
  visible: PropTypes.bool.isRequired,
  disabled: PropTypes.bool.isRequired,
  titleLabel: PropTypes.string.isRequired,
  messageLabel: PropTypes.string.isRequired,
  inputLabel: PropTypes.string.isRequired,
  inputValue: PropTypes.string,
  cancelLabel: PropTypes.string.isRequired,
  cancelAction: PropTypes.func.isRequired,
  okLabel: PropTypes.string.isRequired,
  okAction: PropTypes.func.isRequired
};

SingleInputDialog.defaultProps = {
};

export default SingleInputDialog;
