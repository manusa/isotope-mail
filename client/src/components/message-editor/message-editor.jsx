import React, {Component} from 'react';
import {connect} from 'react-redux';
import {translate} from 'react-i18next';
import PropTypes from 'prop-types';
import {Editor} from '@tinymce/tinymce-react';
import EDITOR_BUTTONS from './editor-buttons';
import EDITOR_CONFIG from './editor-config';
import Button from '../buttons/button';
import HeaderAddress from './header-address';
import MceButton from './mce-button';
import InsertLinkDialog from './insert-link-dialog';
import {getCredentials} from '../../selectors/application';
import {editMessage} from '../../actions/application';
import {sendMessage} from '../../services/smtp';
import {prettySize} from '../../services/prettify';
import {getAddresses} from '../../services/message-addresses';
import {persistApplicationNewMessageContent} from '../../services/indexed-db';
import styles from './message-editor.scss';
import mainCss from '../../styles/main.scss';

const EDITOR_PERSISTED_AFTER_CHARACTERS_ADDED = 50;

class MessageEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      linkDialogVisible: false,
      linkDialogUrl: '',
      dropZoneActive: false,
      // Stores state of current selection in the dialog (is title, underlined... H1, H2, ..., italic, underline)
      // Used in editor buttons to activate/deactivate them
      editorState: {}
    };

    this.headerFormRef = React.createRef();
    this.editorRef = React.createRef();
    this.handleSetState = patchedState => this.setState(patchedState);
    this.handleSubmit = this.submit.bind(this);
    // Global events
    this.handleOnDrop = this.onDrop.bind(this);
    this.handleOnDragOver = this.onDragOver.bind(this);
    this.handleOnDragLeave = this.onDragLeave.bind(this);
    // Header Address Events
    this.handleAddAddress = this.addAddress.bind(this);
    this.handleRemoveAddress = this.removeAddress.bind(this);
    this.handleMoveAddress = this.moveAddress.bind(this);
    // Subject events
    this.handleOnSubjectChange = this.onSubjectChange.bind(this);
    // Editor events
    this.handleEditorChange = this.editorChange.bind(this);
    this.handleEditorBlur = this.editorBlur.bind(this);
    this.handleSelectionChange = this.selectionChange.bind(this);
    this.handleEditorInsertLink = this.editorInsertLink.bind(this);
  }

  render() {
    const {t, className, close, application, to, cc, bcc, attachments, subject, content} = this.props;
    return (
      <div
        className={`${className} ${styles['message-editor']}`}
        onDrop={this.handleOnDrop} onDragOver={this.handleOnDragOver} onDragLeave={this.handleOnDragLeave}>
        {this.state.dropZoneActive ?
          <div className={styles.dropZone}>
            <div className={styles.dropZoneMessage}>
              <i className={'material-icons'}>attach_file</i>
              {t('messageEditor.dropZoneMessage')}
            </div>
          </div>
          : null}
        <div className={styles.header}>
          <form ref={this.headerFormRef}>
            <HeaderAddress id={'to'} addresses={to} onAddressAdd={this.handleAddAddress}
              onAddressRemove={this.handleRemoveAddress}
              onAddressMove={this.handleMoveAddress}
              className={styles.address} chipClassName={styles.chip}
              autoSuggestClassName={styles.autoSuggest} autoSuggestMenuClassName={styles.autoSuggestMenu}
              getAddresses={this.props.getAddresses} label={t('messageEditor.to')} />
            <HeaderAddress id={'cc'} addresses={cc} onAddressAdd={this.handleAddAddress}
              onAddressRemove={this.handleRemoveAddress}
              onAddressMove={this.handleMoveAddress}
              className={styles.address} chipClassName={styles.chip}
              autoSuggestClassName={styles.autoSuggest} autoSuggestMenuClassName={styles.autoSuggestMenu}
              getAddresses={this.props.getAddresses} label={t('messageEditor.cc')} />
            <HeaderAddress id={'bcc'} addresses={bcc} onAddressAdd={this.handleAddAddress}
              onAddressRemove={this.handleRemoveAddress}
              onAddressMove={this.handleMoveAddress}
              className={styles.address} chipClassName={styles.chip}
              autoSuggestClassName={styles.autoSuggest} autoSuggestMenuClassName={styles.autoSuggestMenu}
              getAddresses={this.props.getAddresses} label={t('messageEditor.bcc')} />
            <div className={styles.subject}>
              <input type={'text'} placeholder={t('messageEditor.subject')}
                value={subject} onChange={this.handleOnSubjectChange} />
            </div>
          </form>
        </div>
        <div className={styles['editor-wrapper']} onClick={() => this.editorWrapperClick()}>
          <div className={styles['editor-container']}>
            <Editor
              ref={this.editorRef}
              initialValue={content}
              onEditorChange={this.handleEditorChange}
              onSelectionChange={this.handleSelectionChange}
              // Force initial content (reply messages) to be persisted in IndexedDB with base64/datauri embedded images
              onInit={() => this.getEditor().uploadImages().then(() => this.getEditor().fire('Change'))}
              onBlur={this.handleEditorBlur}
              onPaste={event => this.editorPaste(event)}
              inline={true}
              init={EDITOR_CONFIG}
            />
            <div className={styles.attachments}>
              {attachments.map((a, index) =>
                <div key={index} className={styles.attachment}>
                  <span className={styles.fileName}>{a.fileName}</span>
                  <span className={styles.size}>({prettySize(a.size, 0)})</span>
                  <Button className={styles.delete} icon={'delete'} onClick={() => this.removeAttachment(a)}/>
                </div>
              )}
            </div>
          </div>
          {this.renderEditorButtons()}
        </div>
        <div className={styles['action-buttons']}>
          <button
            className={`${mainCss['mdc-button']} ${mainCss['mdc-button--unelevated']}
            ${styles['action-button']} ${styles.send}`}
            disabled={to.length + cc.length + bcc.length === 0} onClick={this.handleSubmit}>
            {t('messageEditor.send')}
          </button>
          <button className={`material-icons ${mainCss['mdc-icon-button']} ${styles['action-button']} ${styles.cancel}`}
            onClick={() => close(application)}>
            delete
          </button>
        </div>
        <InsertLinkDialog
          visible={this.state.linkDialogVisible}
          closeDialog={() => this.setState({linkDialogVisible: false, linkDialogInitialUrl: ''})}
          onChange={e => this.setState({linkDialogUrl: e.target.value})}
          url={this.state.linkDialogUrl} insertLink={this.handleEditorInsertLink}
        />
      </div>
    );
  }

  renderEditorButtons() {
    return <div className={`${mainCss['mdc-card']} ${styles['button-container']}`}>
      {Object.entries(EDITOR_BUTTONS).map(([k, b]) => (
        <MceButton
          key={k}
          className={styles.button}
          activeClassName={styles.active}
          iconClassName={styles.buttonIcon}
          active={this.state.editorState && this.state.editorState[k] === true}
          label={b.label}
          icon={b.icon}
          onToggle={() => b.toggleFunction(this.getEditor(), b, this.handleSetState)}
        />))}
    </div>;
  }

  submit() {
    if (this.headerFormRef.current.reportValidity()) {
      // Get content directly from editor, state content may not contain latest changes
      const content = this.getEditor().getContent();
      const {credentials, to, cc, bcc, subject} = this.props;
      this.props.sendMessage(credentials, {...this.props.editedMessage, to, cc, bcc, subject, content});
      this.props.close(this.props.application);
    }
  }
  /**
   * Adds an address to the list matching the id.
   *
   * @param id
   * @param address
   */
  addAddress(id, address) {
    if (address.length > 0) {
      const updatedMessage = {...this.props.editedMessage};
      updatedMessage[id] = [...updatedMessage[id], address];
      this.props.editMessage(updatedMessage);
    }
  }

  /**
   * Removes the address from the under the field matching the id.
   *
   * @param id
   * @param address
   */
  removeAddress(id, address) {
    const updatedMessage = {...this.props.editedMessage};
    updatedMessage[id] = [...updatedMessage[id]];
    updatedMessage[id].splice(updatedMessage[id].indexOf(address), 1);
    this.props.editMessage(updatedMessage);
  }

  /**
   * Moves an address from the address list under the field matching the fromId to the address field
   * matching the toId.
   *
   * @param fromId
   * @param toId
   * @param address
   */
  moveAddress(fromId, toId, address) {
    const updatedMessage = {...this.props.editedMessage};
    // Remove
    updatedMessage[fromId].splice(updatedMessage[fromId].indexOf(address), 1);
    // Add
    updatedMessage[toId] = [...updatedMessage[toId], address];
    this.props.editMessage(updatedMessage);
  }

  onSubjectChange(event) {
    const target = event.target;
    const updatedMessage = {...this.props.editedMessage};
    this.props.editMessage({...updatedMessage, subject: target.value});
  }

  onDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    this.setState({dropZoneActive: false});
    const addAttachment = (file, dataUrl) => {
      const newAttachment = {
        fileName: file.name,
        size: file.size,
        contentType: file.type,
        content: dataUrl.currentTarget.result.replace(/^data:[^;]*;base64,/, '')
      };
      const updatedMessage = {...this.props.editedMessage};
      updatedMessage.attachments = updatedMessage.attachments ?
        [...updatedMessage.attachments, newAttachment] : [newAttachment];
      this.props.editMessage(updatedMessage);
    };
    Array.from(event.dataTransfer.files).forEach(file => {
      const fileReader = new FileReader();
      fileReader.onload = addAttachment.bind(this, file);
      fileReader.readAsDataURL(file);
    });
    return true;
  }

  onDragOver(event) {
    event.preventDefault();
    if (event.dataTransfer.types && Array.from(event.dataTransfer.types).includes('Files')) {
      this.setState({dropZoneActive: true});
    }
  }

  onDragLeave(event) {
    event.preventDefault();
    this.setState({dropZoneActive: false});
  }

  removeAttachment(attachment) {
    const updatedMessage = {...this.props.editedMessage};
    if (updatedMessage.attachments && updatedMessage.attachments.length) {
      updatedMessage.attachments = updatedMessage.attachments.filter(a => a !== attachment);
      this.props.editMessage(updatedMessage);
    }
  }

  getEditor() {
    if (this.editorRef.current && this.editorRef.current.editor) {
      return this.editorRef.current.editor;
    }
    return null;
  }

  editorWrapperClick() {
    this.getEditor().focus();
  }

  /**
   * Every change in the editor will trigger this method.
   *
   * For performance reasons, we'll only persist the editor content every EDITOR_PERSISTED_AFTER_CHARACTERS_ADDED
   *
   * @param content
   */
  editorChange(content) {
    // Commit changes every 50 keystrokes
    if (Math.abs(this.props.content.length - content.length) > EDITOR_PERSISTED_AFTER_CHARACTERS_ADDED) {
      this.props.editMessage({...this.props.editedMessage, content});
      // noinspection JSIgnoredPromiseFromCall
      persistApplicationNewMessageContent(this.props.application, content);
    }
  }

  /**
   * Persist whatever is in the editor as changes are only persisted every EDITOR_PERSISTED_AFTER_CHARACTERS_ADDED
   */
  editorBlur() {
    const content = this.getEditor().getContent();
    this.props.editMessage({...this.props.editedMessage, content});
    // noinspection JSIgnoredPromiseFromCall
    persistApplicationNewMessageContent(this.props.application, content);
  }

  editorPaste(pasteEvent) {
    if (pasteEvent.clipboardData) {
      const editor = this.getEditor();
      const items = pasteEvent.clipboardData.items;

      const insertBlob = (type, e) => {
        const objectUrl = URL.createObjectURL(new Blob([e.target.result], {type}));
        editor.execCommand('mceInsertContent', false, `<img alt="" src="${objectUrl}"/>`);
      };

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image/') === 0) {
          pasteEvent.preventDefault();
          // Although item.getAsFile() is effectively a Blob, in some Linux Desktop environments, mime type of the
          // File/Blob is lost when creating the object URL. This workaround prevents mime type from being lost
          // Data is Pasted as File(Blob), it's read with FileReader again, and reconverted to Blob to create ObjectUrl
          const blobReader = new FileReader();
          const type = item.type;

          blobReader.onload = insertBlob.bind(null, [type]);
          blobReader.readAsArrayBuffer(item.getAsFile());
        }
      }
    }
  }

  editorInsertLink() {
    let href = this.state.linkDialogUrl;
    if (href.indexOf('://') < 0 && href.indexOf('mailto:') < 0) {
      href = `http://${href}`;
    }
    const editor = this.getEditor();
    const selection = editor.selection;
    if (!selection
      || (selection.getContent().length === 0
        && selection.getNode().tagName !== 'A'
        && selection.getNode().parentNode.tagName !== 'A')) {
      // Insert new Link
      editor.execCommand('mceInsertContent', false, `<a href="${href}">${href}</a>`);
    } else {
      // Edit existing link in current node or create link with current selection
      editor.execCommand('mceInsertLink', false, href);
    }
    this.setState({linkDialogVisible: false});
  }

  selectionChange() {
    const editorState = {};
    const editor = this.getEditor();
    if (!editor || !editor.selection) {
      return;
    }
    const node = editor.selection.getNode();
    Object.entries(EDITOR_BUTTONS).forEach(([k, button]) => {
      editorState[k] = button.activeFunction({editor, key: k, button, node});
    });
    // Trigger state change only if values of the selection have changed
    for (const [k, v] of Object.entries(editorState)) {
      if (v !== this.state.editorState[k]) {
        this.setState({editorState});
        break;
      }
    }
  }
}

MessageEditor.propTypes = {
  className: PropTypes.string,
  t: PropTypes.func.isRequired
};

MessageEditor.defaultProps = {
  className: ''
};

const mapStateToProps = state => ({
  application: state.application,
  credentials: getCredentials(state),
  editedMessage: state.application.newMessage,
  to: state.application.newMessage.to,
  cc: state.application.newMessage.cc,
  bcc: state.application.newMessage.bcc,
  attachments: state.application.newMessage.attachments,
  subject: state.application.newMessage.subject,
  editor: state.application.newMessage.editor,
  content: state.application.newMessage.content,
  getAddresses: value => getAddresses(value, state.messages.cache)
});

const mapDispatchToProps = dispatch => ({
  close: application => {
    dispatch(editMessage(null));
    // Clear content (editorBlur may be half way through -> force a message in the service worker to clear content after)
    // noinspection JSIgnoredPromiseFromCall
    persistApplicationNewMessageContent(application, '');
  },
  editMessage: message => {
    dispatch(editMessage(message));
  },
  sendMessage: (credentials, {inReplyTo, references, to, cc, bcc, attachments, subject, content}) =>
    sendMessage(dispatch, credentials, {inReplyTo, references, to, cc, bcc, attachments, subject, content})
});

export default connect(mapStateToProps, mapDispatchToProps)(translate()(MessageEditor));
