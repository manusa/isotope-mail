import React, {Component} from 'react';
import {connect} from 'react-redux';
import {translate} from 'react-i18next';
import PropTypes from 'prop-types';
import {Editor} from '@tinymce/tinymce-react';
import HeaderAddress from './header-address';
import {editMessage} from '../../actions/application';
import {sendMessage} from '../../services/smtp';
import mainCss from '../../styles/main.scss';
import styles from './message-editor.scss';
import MceButton from './mce-button';

const EDITOR_PERSISTED_AFTER_CHARACTERS_ADDED = 50;

function _isStyled(editor, button) {
  return editor && editor.getContent().length > 0 && editor.queryCommandState(button.command);
}

function _isBlockStyled(editor, button, key) {
  return editor && editor.getContent().length > 0 && editor.selection.getNode().tagName === key;
}

function _isBlockStyledFromParent(editor, button, key) {
  return editor && editor.getContent().length > 0 && editor.selection.getNode().closest(key) !== null;
}

function _toggleStyle(editor, button) {
  editor.execCommand(button.command);
}

function _toggleBlockStyle(editor, button) {
  // Remove font-size
  Array.from(editor.selection.getNode().getElementsByTagName('*')).forEach(e => {
    e.style['font-size'] = '';
  });
  // editor.execCommand('mceToggleFormat', false, button.blockCommand);
  editor.execCommand('FormatBlock', false, button.blockCommand);
}

const EDITOR_BUTTONS = {
  bold: {
    command: 'bold', icon: 'format_bold',
    activeFunction: _isStyled, toggleFunction: _toggleStyle},
  italic: {
    command: 'italic', icon: 'format_italic',
    activeFunction: _isStyled, toggleFunction: _toggleStyle},
  underline: {
    command: 'underline', icon: 'format_underline',
    activeFunction: _isStyled, toggleFunction: _toggleStyle},
  UL: {
    command: 'InsertUnorderedList', icon: 'format_list_bulleted',
    activeFunction: _isBlockStyledFromParent, toggleFunction: _toggleStyle},
  OL: {
    command: 'InsertOrderedList', icon: 'format_list_numbered',
    activeFunction: _isBlockStyledFromParent, toggleFunction: _toggleStyle},
  H1: {
    blockCommand: 'h1', label: 'H1', activeFunction: _isBlockStyled, toggleFunction: _toggleBlockStyle},
  H2: {
    blockCommand: 'h2', label: 'H2', activeFunction: _isBlockStyled, toggleFunction: _toggleBlockStyle},
  H3: {
    blockCommand: 'h3', label: 'H3', activeFunction: _isBlockStyled, toggleFunction: _toggleBlockStyle},
  blockquote: {
    blockCommand: 'blockquote', icon: 'format_quote',
    activeFunction: _isBlockStyledFromParent,
    toggleFunction: _toggleBlockStyle},
  PRE: {
    blockCommand: 'pre', icon: 'space_bar', activeFunction: _isBlockStyled, toggleFunction: _toggleBlockStyle},
  code: {
    blockCommand: 'isotope_code', icon: 'code',
    activeFunction: editor => {
      const node = editor.selection.getNode();
      return node.tagName === 'PRE' && node.className === 'code';
    },
    toggleFunction: _toggleBlockStyle}
};

const EDITOR_CONFIG = {
  menubar: false,
  statusbar: false,
  toolbar: false,
  plugins: 'autoresize',
  content_style: 'body {padding:0}', // DOESN'T WORK
  browser_spellcheck: true,
  entity_encoding: 'named',
  formats: {
    isotope_code: {
      block: 'pre', classes: ['code']
    }
  }
};

class MessageEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editorState: {}
    };

    this.editorRef = React.createRef();
    this.handleSubmit = this.submit.bind(this);
    // Header Address Events
    this.handleOnHeaderKeyPress = this.onHeaderKeyPress.bind(this);
    this.handleOnHeaderBlur = this.onHeaderBlur.bind(this);
    this.handleOnHeaderAddressRemove = this.onHeaderAddressRemove.bind(this);
    // Subject events
    this.handleOnSubjectChange = this.onSubjectChange.bind(this);
    // Editor events
    this.handleEditorChange = this.editorChange.bind(this);
    this.handleEditorBlur = this.editorBlur.bind(this);
    this.handleSelectionChange = this.selectionChange.bind(this);
  }

  render() {
    const {t, className, close, to, cc, bcc, subject, content} = this.props;
    return (
      <div className={`${className} ${styles['message-editor']}`}>
        <div className={styles.header}>
          <HeaderAddress id={'to'} addresses={to} onKeyPress={this.handleOnHeaderKeyPress}
            onBlur={this.handleOnHeaderBlur} onAddressRemove={this.handleOnHeaderAddressRemove}
            className={styles.address} chipClassName={styles.chip} label={t('messageEditor.to')} />
          <HeaderAddress id={'cc'} addresses={cc} onKeyPress={this.handleOnHeaderKeyPress}
            onBlur={this.handleOnHeaderBlur} onAddressRemove={this.handleOnHeaderAddressRemove}
            className={styles.address} chipClassName={styles.chip} label={t('messageEditor.cc')} />
          <HeaderAddress id={'bcc'} addresses={bcc} onKeyPress={this.handleOnHeaderKeyPress}
            onBlur={this.handleOnHeaderBlur} onAddressRemove={this.handleOnHeaderAddressRemove}
            className={styles.address} chipClassName={styles.chip} label={t('messageEditor.bcc')} />
          <div className={styles.subject}>
            <input type={'text'} placeholder={'Subject'}
              value={subject} onChange={this.handleOnSubjectChange} />
          </div>
        </div>
        <div className={styles['editor-wrapper']} onClick={() => this.editorWrapperClick()}>
          <div className={styles['editor-container']}>
            <Editor
              ref={this.editorRef}
              initialValue={content}
              onEditorChange={this.handleEditorChange}
              onSelectionChange={this.handleSelectionChange}
              onBlur={this.handleEditorBlur}
              inline={true}
              init={EDITOR_CONFIG}
            />
          </div>
          {this.renderEditorButtons()}
        </div>
        <div className={styles['action-buttons']}>
          <button
            className={`${mainCss['mdc-button']} ${mainCss['mdc-button--unelevated']}
            ${styles['action-button']} ${styles.send}`}
            disabled={to.length + cc.length + bcc.length === 0} onClick={this.handleSubmit}>
            Send
          </button>
          <button className={`material-icons ${mainCss['mdc-icon-button']} ${styles['action-button']} ${styles.cancel}`}
            onClick={close}>
            delete
          </button>
        </div>
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
          active={this.state.editorState && this.state.editorState[k] === true}
          label={b.label}
          icon={b.icon}
          onToggle={() => b.toggleFunction(this.getEditor(), b)}
        />))}
    </div>;
  }

  submit() {
    // Get content directly from editor, state content may not contain latest changes
    const content = this.getEditor().getContent();
    const {credentials, to, cc, bcc, subject} = this.props;
    sendMessage(credentials, {to, cc, bcc, subject, content});
    this.props.close();
  }

  onHeaderAddressRemove(id, index) {
    const updatedMessage = {...this.props.editedMessage};
    updatedMessage[id] = [...updatedMessage[id]];
    updatedMessage[id].splice(index, 1);
    this.props.editMessage(updatedMessage);
  }

  onHeaderKeyPress(event) {
    const target = event.target;
    if (event.key === 'Enter' || event.key === ';') {
      if (target.validity.valid) {
        this.addAddress(target);
        target.focus();
        event.preventDefault();
      } else {
        target.reportValidity();
      }
    }
  }

  onHeaderBlur(event) {
    const target = event.target;
    if (target.value.length > 0) {
      if (target.validity.valid) {
        this.addAddress(target);
      } else {
        event.preventDefault();
        setTimeout(() => target.reportValidity());
      }
    }
  }

  onSubjectChange(event) {
    const target = event.target;
    const updatedMessage = {...this.props.editedMessage};
    this.props.editMessage({...updatedMessage, subject: target.value});
  }
  /**
   * Adds an address to the list matching the id and value in the provided event target.
   *
   * @param target {object}
   */
  addAddress(target) {
    const value = target.value.replace(/;/g, '');
    if (value.length > 0) {
      const updatedMessage = {...this.props.editedMessage};
      updatedMessage[target.id] = [...updatedMessage[target.id], target.value.replace(/;/g, '')];
      this.props.editMessage(updatedMessage);
      target.value = '';
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
    }
  }

  /**
   * Persist whatever is in the editor as changes are only persisted every EDITOR_PERSISTED_AFTER_CHARACTERS_ADDED
   */
  editorBlur() {
    const content = this.getEditor().getContent()
    this.props.editMessage({...this.props.editedMessage, content});
  }

  selectionChange() {
    const editor = this.getEditor();
    const editorState = {};
    Object.entries(EDITOR_BUTTONS).forEach(([k, b]) => {
      editorState[k] = b.activeFunction(editor, b, k);
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
  credentials: state.application.user.credentials,
  editedMessage: state.application.newMessage,
  to: state.application.newMessage.to,
  cc: state.application.newMessage.cc,
  bcc: state.application.newMessage.bcc,
  subject: state.application.newMessage.subject,
  editor: state.application.newMessage.editor,
  content: state.application.newMessage.content
});

const mapDispatchToProps = dispatch => ({
  close: () => dispatch(editMessage(null)),
  editMessage: message => dispatch(editMessage(message))
});

export default connect(mapStateToProps, mapDispatchToProps)(translate()(MessageEditor));
