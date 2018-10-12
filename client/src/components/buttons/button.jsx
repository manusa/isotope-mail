import React, {Component} from 'react';
import PropTypes from 'prop-types';
import mainCss from '../../styles/main.scss';

class Button extends Component {
  render() {
    const {className, type, label, icon, onClick} = this.props;
    return (<button type={type} className={`${mainCss['mdc-button']} ${className}`} onClick={onClick}>
      {icon.length > 0 ?
        (<i className={`material-icons ${mainCss['mdc-button__icon']}`}>{icon}</i>)
        : null}
      {label}
    </button>);
  }
}

Button.propTypes = {
  className: PropTypes.string,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  label: PropTypes.string,
  icon: PropTypes.string,
  onClick: PropTypes.func
};

Button.defaultProps = {
  className: '',
  type: 'button',
  label: '',
  icon: '',
  onClick: () => {}
};

export default Button;
