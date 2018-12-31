import React, {Component} from 'react';
import Dialog from '../dialog/dialog';
import TextField from '../form/text-field/text-field';
import {translate} from 'react-i18next';
import {connect} from 'react-redux';
import {renameFolder as actionRenameFolder} from '../../actions/application';
import {renameFolder as serviceRenameFolder} from '../../services/folder';
import styles from './folder-rename-dialog.scss';
import mainCss from '../../styles/main.scss';

class FolderRenameDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: this.props.folderToRename ? this.props.folderToRename.name : ''
    };
    this.formRef = React.createRef();
    this.handleRenameFolder = this.renameFolder.bind(this);
    this.handleTextfieldKeyDown = this.textfieldKeyDown.bind(this);
  }

  render() {
    const {t, folderToRename, cancel, application} = this.props;
    const disabled = application.activeRequests > 0;
    const actions = [
      {label: t('renameFolderDialog.cancel'), disabled, action: cancel},
      {label: t('renameFolderDialog.rename'), disabled, action: this.handleRenameFolder}
    ];
    const folderName = folderToRename ? folderToRename.name : '';
    return (
      <Dialog
        visible={folderToRename !== null}
        className={styles.renameFolderDialog}
        containerClassName={styles.container}
        contentClassName={styles.content}
        title={t('renameFolderDialog.title')}
        actions={actions}
      >
        <span>{t('renameFolderDialog.message', {folderName: folderName})}</span>
        <form ref={this.formRef} onSubmit={this.handleRenameFolder}>
          <TextField id={'folderName'} focused={true} type={'text'} fieldClass={mainCss['mdc-text-field--fullwidth']}
            disabled={disabled}
            label={t('renameFolderDialog.folderNameLabel')} value={this.state.value} required={true}
            onChange={e => this.setState({value: e.target.value})} onKeyDown={this.handleTextfieldKeyDown}
          />
        </form>
      </Dialog>
    );
  }

  componentWillUpdate(nextProps) {
    if (nextProps.folderToRename) {
      if (!this.props.folderToRename || nextProps.folderToRename.name !== this.props.folderToRename.name) {
        this.setState({
          value: nextProps.folderToRename.name
        });
      }
    }
  }

  renameFolder() {
    if (this.props.application.activeRequests === 0 && this.formRef.current.reportValidity()) {
      this.props.renameFolder(this.props.folderToRename, this.state.value);
    }
  }

  textfieldKeyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.renameFolder();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.props.cancel();
    }
  }
}

FolderRenameDialog.propTypes = {
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
