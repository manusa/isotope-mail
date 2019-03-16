import React from 'react';
import PropTypes from 'prop-types';

const IconButton = ({className, onClick, disabled, children}) =>
  (<button className={`material-icons ${className}`}
    disabled={disabled} onClick={onClick}>
    {children}
  </button>);

IconButton.propTypes = {
  className: PropTypes.string,
  onClick: PropTypes.func,
  disabled: PropTypes.bool
};

IconButton.defaultProps = {
  className: '',
  onClick: () => {},
  disabled: false
};

export default IconButton;
