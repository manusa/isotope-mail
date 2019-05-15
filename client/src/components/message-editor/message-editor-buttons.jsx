import React from 'react';
import PropTypes from 'prop-types';
import MceButton from './mce-button';
import EDITOR_BUTTONS from './editor-buttons';
import mainCss from '../../styles/main.scss';

const MessageEditorButtons = ({editor, editorState, parentSetState}) => (
  <div className={`${mainCss['mdc-card']} ${mainCss['message-editor__button-container']}`}>
    {Object.entries(EDITOR_BUTTONS).map(([k, b]) => (
      <MceButton
        key={k}
        className={mainCss['message-editor__button']}
        activeClassName={mainCss['message-editor__button--active']}
        iconClassName={mainCss['message-editor__button-icon']}
        active={editorState && editorState[k] === true}
        label={b.label}
        icon={b.icon}
        onToggle={() => b.toggleFunction(editor, b, parentSetState)}
      />))}
  </div>
);

MessageEditorButtons.propTypes = {
  editor: PropTypes.object,
  editorState: PropTypes.object,
  parentSetState: PropTypes.func.isRequired
};

export default MessageEditorButtons;
