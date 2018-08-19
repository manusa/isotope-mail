import React, {Component} from 'react';
import PropTypes from 'prop-types';
import mainCss from '../../../styles/main.scss';

class TextField extends Component {
  constructor(props) {
    super(props);
    this.inputRef = React.createRef();
    this.state = {
      focused: false
    };
    this.onFocus = this.onFocus.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.handleOnChange = this.handleOnChange.bind(this);
  }
  render() {
    return (
      <div className={`${mainCss['mdc-text-field']} ${this.state.focused ? 'mdc-text-field--focused' : ''}
        ${this.props.fieldClass}`}>
        <input type={this.props.type} ref={this.inputRef} id={this.props.id}
          className={`${mainCss['mdc-text-field__input']} ${this.props.inputClass}`}
          required={this.props.required} autoComplete={this.props.autoComplete}
          min={this.props.min}
          value={this.props.value}
          onFocus={this.onFocus} onBlur={this.onBlur}
          onChange={this.handleOnChange} />
        <label htmlFor={this.props.id}
          className={`${mainCss['mdc-floating-label']}
          ${this.state.focused || this.props.value ? 'mdc-floating-label--float-above' : ''}
          ${this.props.labelClass}`}>{this.props.label}</label>
        <div className={`${mainCss['mdc-line-ripple']}
          ${this.state.focused ? 'mdc-line-ripple--active' : ''}
          ${this.props.lineRippleClass}`}></div>
      </div>
    );
  }
  componentDidMount() {
    if (this.props.focused) {
      this.inputRef.current.focus();
      this.inputRef.current.selectionStart = this.inputRef.current.selectionEnd = this.inputRef.current.value.length;
    }
  }
  onFocus() {
    if (!this.state.focused) {
      this.setState({focused: true});
    }
  }

  onBlur() {
    if (this.state.focused) {
      this.setState({focused: false});
    }
  }

  handleOnChange(event) {
    if (this.props.onChange) {
      this.props.onChange(event);
    }
  }
}

TextField.propTypes = {
  id: PropTypes.string.isRequired,
  focused: PropTypes.bool.isRequired,
  fieldClass: PropTypes.string,
  inputClass: PropTypes.string,
  labelClass: PropTypes.string,
  lineRippleClass: PropTypes.string,
  required: PropTypes.bool,
  autoComplete: PropTypes.string,
  label: PropTypes.string,
  onChange: PropTypes.func,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  type: PropTypes.string.isRequired,
  min: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ])
};

TextField.defaultProps = {
  focused: false,
  fieldClass: '',
  inputClass: '',
  labelClass: '',
  lineRippleClass: '',
  required: false,
  autoComplete: 'off',
  type: 'text',
  min: ''
};

export default TextField;
