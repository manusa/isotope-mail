import React, {Component} from 'react';
import {connect} from 'react-redux';
import {translate} from 'react-i18next';
import PropTypes from 'prop-types';
import {Editor} from '@tinymce/tinymce-react';
import EDITOR_BUTTONS from './editor-buttons';
import EDITOR_CONFIG from './editor-config';
import Button from '../buttons/button';
import IconButton from '../buttons/icon-button';
import HeaderAddress from './header-address';
import MessageEditorButtons from './message-editor-buttons';
import InsertLinkDialog from './insert-link-dialog';
import {getCredentials} from '../../selectors/application';
import {cache} from '../../selectors/messages';
import {editMessage, editMessageSubject} from '../../actions/application';
import debounce from '../../services/debounce';
import {compressImage} from '../../services/image';
import {getAddresses} from '../../services/message-addresses';
import {prettySize} from '../../services/prettify';
import {sendMessage} from '../../services/smtp';
import {persistApplicationNewMessageContent} from '../../services/indexed-db';
import mainCss from '../../styles/main.scss';

const SAVE_EDITOR_DEBOUNCE_PERIOD_IN_MILLIS = 500;
const PASTED_IMAGE_COMPRESS_SIZE_THRESHOLD = 1024 * 1024;

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
    this.handleCloseEditor = this.closeEditor.bind(this);
    // Global events
    this.handleOnDrop = this.onDrop.bind(this);
    this.handleOnDragOver = this.onDragOver.bind(this);
    this.handleOnDragLeave = this.onDragLeave.bind(this);
    // File dialog related
    this.fileDialogRef = React.createRef();
    this.handleOpenFileDialog = this.openFileDialog.bind(this);
    this.handleOnFileDialogChange = this.onFileDialogChange.bind(this);
    // Header Address Events
    this.handleAddAddress = this.addAddress.bind(this);
    this.handleRemoveAddress = this.removeAddress.bind(this);
    this.handleMoveAddress = this.moveAddress.bind(this);
    // Subject events
    this.handleOnSubjectChange = this.onSubjectChange.bind(this);
    // Editor events
    this.handleEditorChange = debounce(this.editorChange.bind(this), SAVE_EDITOR_DEBOUNCE_PERIOD_IN_MILLIS);
    this.handleSelectionChange = this.selectionChange.bind(this);
    this.handleEditorInsertLink = this.editorInsertLink.bind(this);
  }

  render() {
    const {t, className, to, cc, bcc, attachments, subject, content} = this.props;
    return (
      <div
        className={`${className} ${mainCss['message-editor']}`}
        onDrop={this.handleOnDrop} onDragOver={this.handleOnDragOver} onDragLeave={this.handleOnDragLeave}>
        {this.state.dropZoneActive &&
          <div className={mainCss['message-editor__drop-zone']}>
            <div className={mainCss['message-editor__drop-zone-message']}>
              <i className={`material-icons ${mainCss['message-editor__drop-zone-icon']}`}>attach_file</i>
              {t('messageEditor.dropZoneMessage')}
            </div>
          </div>
        }
        <input
          type="file" multiple="multiple" className={mainCss['message-editor__file-dialog-input']}
          ref={this.fileDialogRef} onChange={this.handleOnFileDialogChange} />
        <div className={mainCss['message-editor__mobile-wrapper']} onClick={event => this.editorWrapperClick(event)}>
          <div className={mainCss['message-editor__header']}>
            <form ref={this.headerFormRef}>
              <HeaderAddress id={'to'} addresses={to} onAddressAdd={this.handleAddAddress}
                onAddressRemove={this.handleRemoveAddress}
                onAddressMove={this.handleMoveAddress}
                getAddresses={this.props.getAddresses} label={t('messageEditor.to')} />
              <HeaderAddress id={'cc'} addresses={cc} onAddressAdd={this.handleAddAddress}
                onAddressRemove={this.handleRemoveAddress}
                onAddressMove={this.handleMoveAddress}
                getAddresses={this.props.getAddresses} label={t('messageEditor.cc')} />
              <HeaderAddress id={'bcc'} addresses={bcc} onAddressAdd={this.handleAddAddress}
                onAddressRemove={this.handleRemoveAddress}
                onAddressMove={this.handleMoveAddress}
                getAddresses={this.props.getAddresses} label={t('messageEditor.bcc')} />
              <div className={mainCss['message-editor__header-subject']}>
                <input type={'text'} placeholder={t('messageEditor.subject')}
                  value={subject} onChange={this.handleOnSubjectChange} />
              </div>
            </form>
          </div>
          <div className={mainCss['message-editor__wrapper']}>
            <div className={mainCss['message-editor__container']}>
              <Editor
                ref={this.editorRef}
                initialValue={content}
                onEditorChange={this.handleEditorChange}
                onSelectionChange={this.handleSelectionChange}
                // Force initial content (reply messages) to be persisted in IndexedDB with base64/datauri embedded images
                onInit={() => this.getEditor().uploadImages().then(() => this.getEditor().fire('Change'))}
                onPaste={event => this.editorPaste(event)}
                inline={true}
                init={EDITOR_CONFIG}
              />
              <div className={mainCss['message-editor__attachments']}>
                {attachments.map((a, index) =>
                  <div key={index} className={mainCss['message-editor__attachment']}>
                    <span className={mainCss['message-editor__file-name']}>{a.fileName}</span>
                    <span className={mainCss['message-editor__size']}>({prettySize(a.size, 0)})</span>
                    <Button className={mainCss['message-editor__delete']}
                      iconClassName={mainCss['message-editor__delete-icon']} icon={'delete'}
                      onClick={() => this.removeAttachment(a)}/>
                  </div>
                )}
              </div>
            </div>
            <MessageEditorButtons
              editor={this.getEditor()} editorState={this.state.editorState} parentSetState={this.handleSetState}/>
          </div>
        </div>
        <div className={mainCss['message-editor__action-buttons']}>
          <button
            className={`${mainCss['mdc-button']} ${mainCss['mdc-button--unelevated']}
            ${mainCss['message-editor__action-button']} ${mainCss['message-editor__send']}`}
            disabled={to.length + cc.length + bcc.length === 0} onClick={this.handleSubmit}>
            {t('messageEditor.send')}
          </button>
          <IconButton
            className={`${mainCss['message-editor__action-button']}`}
            onClick={this.handleOpenFileDialog}>
            attach_file
          </IconButton>
          <IconButton
            className={`${mainCss['message-editor__action-button']} ${mainCss['message-editor__cancel']}`}
            onClick={this.handleCloseEditor}>
            delete
          </IconButton>
        </div>
        <InsertLinkDialog
          visible={this.state.linkDialogVisible}
          closeDialog={() => this.setState({linkDialogVisible: false, linkDialogUrl: ''})}
          onChange={e => this.setState({linkDialogUrl: e.target.value})}
          url={this.state.linkDialogUrl} insertLink={this.handleEditorInsertLink}
        />
      </div>
    );
  }

  submit() {
    if (this.headerFormRef.current.reportValidity()) {
      // Get content directly from editor, state content may not contain latest changes
      const content = this.getEditor().getContent();
      const {credentials, to, cc, bcc, subject} = this.props;
      this.props.sendMessage(credentials, {...this.props.editedMessage, to, cc, bcc, subject, content});
      // Prevent debounced function from triggering after editor is closed
      this.handleEditorChange.cancel();
      this.props.close();
    }
  }

  closeEditor() {
    // Prevent debounced function from triggering after editor is closed
    this.handleEditorChange.cancel();
    this.props.close();
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

  addAttachments(files) {
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
    Array.from(files).forEach(file => {
      const fileReader = new FileReader();
      fileReader.onload = addAttachment.bind(this, file);
      fileReader.readAsDataURL(file);
    });
  }

  onSubjectChange(event) {
    this.props.editSubject(event.target.value);
  }

  onDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    this.setState({dropZoneActive: false});
    this.addAttachments(event.dataTransfer.files);
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

  /**
   * When clicking on editor's white space, content editor gets focus.
   * @param event
   */
  editorWrapperClick(event) {
    if (event.target === event.currentTarget
      || event.target.classList.contains(mainCss['message-editor__wrapper'])
      || event.target.classList.contains(mainCss['message-editor__container'])
    ) {
      this.getEditor().focus();
    }
  }

  /**
   * Every change in the editor will trigger this method.
   *
   * @param content modified in editor
   */
  editorChange(content) {
    this.props.editMessage({...this.props.editedMessage, content});
    // noinspection JSIgnoredPromiseFromCall
    persistApplicationNewMessageContent(this.props.application, content);
  }

  editorPaste(pasteEvent) {
    if (pasteEvent.clipboardData) {
      const editor = this.getEditor();
      const items = pasteEvent.clipboardData.items;

      const insertBlob = async (type, e) => {
        let imageBlob = new Blob([e.target.result], {type});
        if (imageBlob.size > PASTED_IMAGE_COMPRESS_SIZE_THRESHOLD) {
          imageBlob = await compressImage(imageBlob);
        }
        const objectUrl = URL.createObjectURL(imageBlob);
        editor.execCommand('mceInsertContent', false, `<img alt="" src="${objectUrl}"/>`);
        // Force pastes images to be persisted in IndexedDB with base64/datauri embedded images
        await editor.uploadImages();
        editor.fire('Change');
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

  openFileDialog() {
    this.fileDialogRef.current.click();
  }

  onFileDialogChange(event) {
    this.addAttachments(event.target.files);
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
  getAddresses: value => getAddresses(value, cache(state))
});

const mapDispatchToProps = dispatch => ({
  close: application => {
    dispatch(editMessage(null));
    // Clear content (previous persist may be half way through -> force a message in the service worker to clear content after)
    // noinspection JSIgnoredPromiseFromCall
    persistApplicationNewMessageContent(application, '');
  },
  editMessage: message => dispatch(editMessage(message)),
  editSubject: subject => dispatch(editMessageSubject(subject)),
  sendMessage: (credentials, {inReplyTo, references, to, cc, bcc, attachments, subject, content}) =>
    sendMessage(dispatch, credentials, {inReplyTo, references, to, cc, bcc, attachments, subject, content})
});

const mergeProps = (stateProps, dispatchProps, ownProps) => (Object.assign({}, stateProps, dispatchProps, ownProps, {
  close: () => dispatchProps.close(stateProps.application)
}));

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(translate()(MessageEditor));
