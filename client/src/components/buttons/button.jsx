import React from 'react';
import PropTypes from 'prop-types';
import mainCss from '../../styles/main.scss';

const Button = ({className, type, label, icon, onClick, disabled}) =>
  (<button type={type} className={`${mainCss['mdc-button']} ${className}`}
    disabled={disabled} onClick={onClick}>
    {icon.length > 0 ?
      (<i className={`material-icons ${mainCss['mdc-button__icon']}`}>{icon}</i>)
      : null}
    {label}
  </button>);

Button.propTypes = {
  className: PropTypes.string,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  label: PropTypes.string,
  icon: PropTypes.string,
  disabled: PropTypes.bool,
  onClick: PropTypes.func
};

Button.defaultProps = {
  className: '',
  type: 'button',
  label: '',
  icon: '',
  disabled: false,
  onClick: () => {}
};

export default Button;
