import React, {Component} from 'react';
import PropTypes from 'prop-types';

export const Type = Object.freeze({
  BLOCK: 'BLOCK',
  INLINE: 'INLINE'
});
class EditorButton extends Component {
  constructor() {
    super();
    this.handleOnToggle = e => {
      e.preventDefault();
      this.props.onToggle(this.props.editorStyle);
    };
  }

  render() {
    const {editorState, editorStyle, type, className, activeClassName, icon, label} = this.props;
    let active = false;
    if (type === Type.BLOCK) {
      const selection = editorState.getSelection();
      const blockType = editorState
        .getCurrentContent()
        .getBlockForKey(selection.getStartKey())
        .getType();
      active = editorStyle === blockType;
    } else if (type === Type.INLINE) {
      active = editorState.getCurrentInlineStyle().has(editorStyle);
    }
    return (
      <button className={`mdc-button ${className} ${active ? activeClassName : ''}`}
        onMouseDown={this.handleOnToggle}
      >
        {icon ?
          <i className="material-icons mdc-button__icon" aria-hidden="true">{icon}</i> : null
        }
        {label}
      </button>
    );
  }
}

EditorButton.propTypes = {
  className: PropTypes.string,
  activeClassName: PropTypes.string,
  type: PropTypes.string.isRequired,
  editorStyle: PropTypes.string.isRequired,
  editorState: PropTypes.object.isRequired,
  icon: PropTypes.string,
  label: PropTypes.string,
  onToggle: PropTypes.func
};

EditorButton.defaultProps = {
  className: '',
  activeClassName: '',
  icon: null,
  label: '',
  onToggle: () => {}
};

export default EditorButton;
