import React, {Component} from 'react';
import {connect} from 'react-redux';
import {translate} from 'react-i18next';
import PropTypes from 'prop-types';
import(/* webpackChunkName: "draft-js" */ 'draft-js/dist/Draft.css');
import {Editor, EditorState, RichUtils} from 'draft-js';
import EditorButton, {Type} from './editor-button';
import HeaderAddress from './header-address';
import {editMessage} from '../../actions/application';
import sanitize from '../../services/sanitize';
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
    this.state = {
      to: [],
      cc: [],
      bcc: [],
      editor: EditorState.createEmpty()
    };
    this.editorRef = React.createRef();
    this.handleSubmit = this.submit.bind(this);
    this.handleOnHeaderKeyPress = this.onHeaderKeyPress.bind(this);
    this.handleOnHeaderBlur = this.onHeaderBlur.bind(this);
    this.handleOnHeaderAddressRemove = this.onHeaderAddressRemove.bind(this);
    this.handleEditorOnChange = editor => this.setState({editor});
    this.handleEditorKeyCommand = this.editorKeyCommand.bind(this);
    this.handleToggleBlockType = this.toggleBlockType.bind(this);
    this.handleToggleInlineStyle = this.toggleInlineStyle.bind(this);
  }

  render() {
    const {t, className, cancel} = this.props;
    return (
      <div className={`${className} ${styles['message-editor']}`}>
        <div className={styles.header}>
          <HeaderAddress id={'to'} addresses={this.state.to} onKeyPress={this.handleOnHeaderKeyPress}
            onBlur={this.handleOnHeaderBlur} onAddressRemove={this.handleOnHeaderAddressRemove}
            className={styles.address} chipClassName={styles.chip} label={t('messageEditor.to')} />
          <HeaderAddress id={'cc'} addresses={this.state.cc} onKeyPress={this.handleOnHeaderKeyPress}
            onBlur={this.handleOnHeaderBlur} onAddressRemove={this.handleOnHeaderAddressRemove}
            className={styles.address} chipClassName={styles.chip} label={t('messageEditor.cc')} />
          <HeaderAddress id={'bcc'} addresses={this.state.bcc} onKeyPress={this.handleOnHeaderKeyPress}
            onBlur={this.handleOnHeaderBlur} onAddressRemove={this.handleOnHeaderAddressRemove}
            className={styles.address} chipClassName={styles.chip} label={t('messageEditor.bcc')} />
          <div className={styles.subject}>
            <input type={'text'} placeholder={'Subject'} />
          </div>
        </div>
        <div className={styles['editor-wrapper']} onClick={() => this.editorWrapperClick()}>
          <Editor
            ref={this.editorRef}
            editorState={this.state.editor}
            blockStyleFn={_getBlockStyle}
            handleKeyCommand={this.handleEditorKeyCommand}
            onChange={this.handleEditorOnChange} />
          {this.renderEditorButtons()}
        </div>
        <div>
          <button className={`${mainCss['mdc-button']} ${mainCss['mdc-button--unelevated']}`}
            onClick={this.handleSubmit}>
            Send
          </button>
          <button className={`${mainCss['mdc-button']} ${mainCss['mdc-button--unelevated']}`}
            onClick={cancel}>
            Cancel
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
            editorState={this.state.editor}
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
    const editorContent = this.editorRef.current.editor.children[0].innerHTML
      .replace(/data-[^=]*?="[^"]*?"/gm, '');
    console.log(this.state.to);
    console.log(this.state.cc);
    console.log(this.state.bcc);
    console.log(sanitize.sanitize(editorContent));
  }

  onHeaderAddressRemove(id, index) {
    const newState = {...this.state};
    newState[id] = [...newState[id]];
    newState[id].splice(index, 1);
    this.setState(newState);
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

  /**
   * Adds an address to the list matching the id and value in the provided event target.
   *
   * @param target {object}
   */
  addAddress(target) {
    const newState = {...this.state};
    newState[target.id] = [...newState[target.id], target.value.replace(/;/g, '')];
    this.setState(newState);
    target.value = '';
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
        this.state.editor,
        blockType
      )
    );
  }

  toggleInlineStyle(inlineStyle) {
    this.handleEditorOnChange(
      RichUtils.toggleInlineStyle(
        this.state.editor,
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

const mapStateToProps = () => ({
});

const mapDispatchToProps = dispatch => ({
  cancel: () => dispatch(editMessage(null))
});

export default connect(mapStateToProps, mapDispatchToProps)(translate()(MessageEditor));
