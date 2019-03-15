import React from 'react';
import PropTypes from 'prop-types';
import mainCss from '../../styles/main.scss';

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
