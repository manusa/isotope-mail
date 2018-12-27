import React, {Component} from 'react';
import PropTypes from 'prop-types';
import mainCss from '../../../styles/main.scss';

class Switch extends Component {
  constructor(props) {
    super(props);
    this.inputRef = React.createRef();
  }

  render() {
    const {id, label, required, checked, onToggle, switchClass, inputClass} = this.props;
    return (
      <span onClick={e => {
        e.preventDefault();
        onToggle();
      }}>
        <div className={`${mainCss['mdc-switch']} ${checked ? mainCss['mdc-switch--checked'] : ''} ${switchClass}`}>
          <div className={mainCss['mdc-switch__track']} />
          <div className={mainCss['mdc-switch__thumb-underlay']}>
            <div className={mainCss['mdc-switch__thumb']}>
              <input type='checkbox' ref={this.inputRef} id={id}
                className={`${mainCss['mdc-switch__native-control']} ${inputClass}`}
                required={required}
                checked={checked}
                readOnly={true}
                role='switch' />
            </div>
          </div>
        </div>
        <label htmlFor={id}>{label}</label>
      </span>
    );
  }
}

Switch.propTypes = {
  id: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]).isRequired,
  label: PropTypes.string,
  required: PropTypes.bool,
  checked: PropTypes.bool,
  onToggle: PropTypes.func,
  switchClass: PropTypes.string,
  inputClass: PropTypes.string
};

Switch.defaultProps = {
  label: '',
  required: false,
  checked: false,
  onToggle: () => {},
  switchClass: '',
  inputClass: ''
};

export default Switch;
