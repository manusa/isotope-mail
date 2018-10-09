import React, {Component} from 'react';
import {connect} from 'react-redux';
import {translate} from 'react-i18next';
import PropTypes from 'prop-types';
import(/* webpackChunkName: "draft-js" */ 'draft-js/dist/Draft.css');
import {Editor, RichUtils} from 'draft-js';
import EditorButton, {Type} from './editor-button';
import HeaderAddress from './header-address';
import {editMessage} from '../../actions/application';
import {sendMessage} from '../../services/smtp';
import mainCss from '../../styles/main.scss';
import styles from './message-editor.scss';

const EDITOR_BUTTONS = {
  BOLD: {editorStyle: 'BOLD', type: Type.INLINE, icon: 'format_bold'},
  ITALIC: {editorStyle: 'ITALIC', type: Type.INLINE, icon: 'format_italic'},
  UNDERLINE: {editorStyle: 'UNDERLINE', type: Type.INLINE, icon: 'format_underline'},
  CODE: {editorStyle: 'CODE', type: Type.INLINE, icon: 'space_bar'},
  'header-one': {editorStyle: 'header-one', type: Type.BLOCK, label: 'H1', className: styles.h1},
  'header-two': {editorStyle: 'header-two', type: Type.BLOCK, label: 'H2', className: styles.h2},
  'header-three': {editorStyle: 'header-three', type: Type.BLOCK, label: 'H3', className: styles.h3},
  blockquote: {editorStyle: 'blockquote', type: Type.BLOCK, icon: 'format_quote', className: styles.blockquote},
  'unordered-list-item': {editorStyle: 'unordered-list-item', type: Type.BLOCK, icon: 'format_list_bulleted'},
  'ordered-list-item': {editorStyle: 'ordered-list-item', type: Type.BLOCK, icon: 'format_list_numbered'},
  'code-block': {editorStyle: 'code-block', type: Type.BLOCK, icon: 'code', className: styles['code-block']}
};

function _getBlockStyle(block) {
  const definedBlock = EDITOR_BUTTONS[block.getType()];
  if (definedBlock) {
    return definedBlock.className;
  }
  return null;
}

class MessageEditor extends Component {
  constructor(props) {
    super(props);

    this.editorRef = React.createRef();
    this.handleSubmit = this.submit.bind(this);
    // Header Address Events
    this.handleOnHeaderKeyPress = this.onHeaderKeyPress.bind(this);
    this.handleOnHeaderBlur = this.onHeaderBlur.bind(this);
    this.handleOnHeaderAddressRemove = this.onHeaderAddressRemove.bind(this);
    // Subject events
    this.handleOnSubjectChange = this.onSubjectChange.bind(this);
    // Editor events
    this.handleEditorOnChange = editor => this.props.editMessage({...this.props.editedMessage, editor});
    this.handleEditorKeyCommand = this.editorKeyCommand.bind(this);
    this.handleToggleBlockType = this.toggleBlockType.bind(this);
    this.handleToggleInlineStyle = this.toggleInlineStyle.bind(this);
  }

  render() {
    const {t, className, close, to, cc, bcc, subject, editor} = this.props;
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
              editorState={editor}
              blockStyleFn={_getBlockStyle}
              handleKeyCommand={this.handleEditorKeyCommand}
              onChange={this.handleEditorOnChange} />
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
      {Object.values(EDITOR_BUTTONS).map(b => {
        let toggleFunction;
        switch (b.type) {
          case Type.BLOCK:
            toggleFunction = this.handleToggleBlockType;
            break;
          case Type.INLINE:
            toggleFunction = this.handleToggleInlineStyle;
            break;
          default:
            toggleFunction = null;
        }
        return (
          <EditorButton key={b.editorStyle}
            editorState={this.props.editor}
            editorStyle={b.editorStyle}
            type={b.type}
            className={styles.button}
            activeClassName={styles.active}
            icon={b.icon}
            label={b.label}
            onToggle={toggleFunction}
          />
        );
      })}
    </div>;
  }

  submit() {
    const {credentials, to, cc, bcc, subject} = this.props;
    const editorContent = this.editorRef.current.editor.children[0].innerHTML
      .replace(/data-[^=]*?="[^"]*?"/gm, '')
      .replace(new RegExp(styles.h1, 'gm'), 'h1')
      .replace(new RegExp(styles.h2, 'gm'), 'h2')
      .replace(new RegExp(styles.h3, 'gm'), 'h3')
      .replace(new RegExp(styles.blockquote, 'gm'), 'blockquote')
      .replace(new RegExp(styles['code-block'], 'gm'), 'code-block')
    sendMessage(credentials, {to, cc, bcc, subject, content: editorContent});
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

  editorWrapperClick() {
    this.editorRef.current.focus();
  }

  editorKeyCommand(command, editor) {
    const newState = RichUtils.handleKeyCommand(editor, command);
    if (newState) {
      this.handleEditorOnChange(newState);
      return 'handled';
    }
    return 'not-handled';
  }

  toggleBlockType(blockType) {
    this.handleEditorOnChange(
      RichUtils.toggleBlockType(
        this.props.editor,
        blockType
      )
    );
  }

  toggleInlineStyle(inlineStyle) {
    this.handleEditorOnChange(
      RichUtils.toggleInlineStyle(
        this.props.editor,
        inlineStyle
      )
    );
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
  editor: state.application.newMessage.editor
});

const mapDispatchToProps = dispatch => ({
  close: () => dispatch(editMessage(null)),
  editMessage: message => dispatch(editMessage(message))
});

export default connect(mapStateToProps, mapDispatchToProps)(translate()(MessageEditor));
