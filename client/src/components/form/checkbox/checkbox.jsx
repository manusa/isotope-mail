import React, {Component} from 'react';
import PropTypes from 'prop-types';
import mainCss from '../../../styles/main.scss';

class Checkbox extends Component {
  constructor(props) {
    super(props);
    this.inputRef = React.createRef();
    this.handleOnChange = this.handleOnChange.bind(this);
  }

  render() {
    return (
      <div className={`${mainCss['mdc-checkbox']} ${mainCss['mdc-checkbox--primary']}
        ${this.props.fieldClass}`}>
        <input type='checkbox' ref={this.inputRef} id={this.props.id}
          className={`${mainCss['mdc-checkbox__native-control']} ${this.props.inputClass}`}
          required={this.props.required}
          checked={this.props.checked}
          onFocus={this.onFocus} onBlur={this.onBlur}
          onChange={this.handleOnChange} />
        <div className={`${mainCss['mdc-checkbox__background']}`}>
          <svg className={mainCss['mdc-checkbox__checkmark']} viewBox="0 0 24 24">
            <path className={mainCss['mdc-checkbox__checkmark-path']} fill="none"
              d="M1.73,12.91 8.1,19.28 22.79,4.59"/>
          </svg>
          <div className={mainCss['mdc-checkbox__mixedmark']}></div>
        </div>
      </div>
    );
  }

  handleOnChange(event) {
    if (this.props.onChange) {
      this.props.onChange(event);
    }
  }
}

Checkbox.propTypes = {
  id: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]).isRequired,
  fieldClass: PropTypes.string,
  inputClass: PropTypes.string,
  required: PropTypes.bool,
  onChange: PropTypes.func,
  checked: PropTypes.bool
};

Checkbox.defaultProps = {
  fieldClass: '',
  inputClass: '',
  required: false,
  checked: false
};

export default Checkbox;
