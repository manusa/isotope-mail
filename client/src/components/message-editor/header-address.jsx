import React, {Component} from 'react';
import {translate} from 'react-i18next';
import PropTypes from 'prop-types';
import mainCss from '../../styles/main.scss';

export class HeaderAddress extends Component {
  constructor(props) {
    super(props);
    this.inputRef = React.createRef();
  }

  render() {
    const {id, className, chipClassName, label, addresses, onKeyPress, onBlur, onAddressRemove} = this.props;
    return (
      <div className={className} onClick={() => this.fieldClick()}>
        <label>{label}:</label>
        {addresses.map((a, index) => (
          <div key={index} className={`${chipClassName} ${mainCss['mdc-chip']}`} >
            <div className={mainCss['mdc-chip__text']}>{a}</div>
            <i onClick={() => onAddressRemove(id, index)} className={`material-icons ${mainCss['mdc-chip__icon']}
               ${mainCss['mdc-chip__icon--trailing']}`}>cancel</i>
          </div>
        ))}
        <input id={id} ref={this.inputRef} onKeyPress={onKeyPress} onBlur={onBlur} type={'email'} />
      </div>
    );
  }

  fieldClick() {
    this.inputRef.current.focus();
  }
}

HeaderAddress.propTypes = {
  t: PropTypes.func,
  id: PropTypes.string.isRequired,
  className: PropTypes.string,
  chipClassName: PropTypes.string,
  addresses: PropTypes.arrayOf(PropTypes.string),
  label: PropTypes.string,
  onKeyPress: PropTypes.func,
  onBlur: PropTypes.func,
  onAddressRemove: PropTypes.func
};

HeaderAddress.defaultProps = {
  className: '',
  chipClassName: '',
  addresses: [],
  label: '',
  onKeyPress: () => {},
  onBlur: () => {},
  onAddressRemove: () => {}
};

export default (translate()(HeaderAddress));
