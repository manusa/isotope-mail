import React, {Component} from 'react';
import PropTypes from 'prop-types';

class MceButton extends Component {
  constructor() {
    super();
    this.handleOnToggle = e => {
      e.preventDefault();
      this.props.onToggle(this.props.editorStyle);
    };
  }

  render() {
    const {className, activeClassName, iconClassName, active, icon, label} = this.props;
    return (
      <button className={`mdc-button ${className} ${active ? activeClassName : ''}`}
        onMouseDown={this.handleOnToggle}
      >
        {icon && <i className={`material-icons mdc-button__icon ${iconClassName}`} aria-hidden="true">{icon}</i>}
        {label}
      </button>
    );
  }
}

MceButton.propTypes = {
  className: PropTypes.string,
  activeClassName: PropTypes.string,
  iconClassName: PropTypes.string,
  active: PropTypes.bool.isRequired,
  icon: PropTypes.string,
  label: PropTypes.string,
  onToggle: PropTypes.func
};

MceButton.defaultProps = {
  className: '',
  activeClassName: '',
  iconClassName: '',
  icon: null,
  label: '',
  onToggle: () => {}
};

export default MceButton;
