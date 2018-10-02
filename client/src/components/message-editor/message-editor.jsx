import React, {Component} from 'react';
import {connect} from 'react-redux';
import {translate} from 'react-i18next';
import PropTypes from 'prop-types';
import {Editor, EditorState, RichUtils} from 'draft-js';
import EditorButton, {Type} from './editor-button';
import {editMessage} from '../../actions/application';
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

class MessageEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {editor: EditorState.createEmpty()};
    this.editorRef = React.createRef();
    this.handleEditorOnChange = editor => this.setState({editor});
    this.handleEditorKeyCommand = this.editorKeyCommand.bind(this);
    this.handleToggleBlockType = this.toggleBlockType.bind(this);
    this.handleToggleInlineStyle = this.toggleInlineStyle.bind(this);
  }

  render() {
    return (
      <div className={`${this.props.className} ${styles['message-editor']}`}>
        <div className={styles['editor-wrapper']} onClick={() => this.editorWrapperClick()}>
          <Editor
            ref={this.editorRef}
            editorState={this.state.editor}
            blockStyleFn={this.getBlockStyle}
            handleKeyCommand={this.handleEditorKeyCommand}
            onChange={this.handleEditorOnChange} />
          {this.renderEditorButtons()}
        </div>
        <div>
          <button className={`${mainCss['mdc-button']} ${mainCss['mdc-button--unelevated']}`}
            onClick={this.props.cancel}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  renderEditorButtons() {
    return <div className={styles['button-container']}>
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

  getBlockStyle(block) {
    const definedBlock = EDITOR_BUTTONS[block.getType()];
    if (definedBlock) {
      return definedBlock.className;
    }
    return null;
  }
}

MessageEditor.propTypes = {
  className: PropTypes.string
};

MessageEditor.defaultProps = {
  className: ''
};

const mapStateToProps = state => ({
});

const mapDispatchToProps = dispatch => ({
  cancel: () => dispatch(editMessage(null))
});

export default connect(mapStateToProps, mapDispatchToProps)(translate()(MessageEditor));
