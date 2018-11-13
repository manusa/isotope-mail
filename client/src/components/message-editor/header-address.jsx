import React, {Component} from 'react';
import {translate} from 'react-i18next';
import PropTypes from 'prop-types';
import mainCss from '../../styles/main.scss';

export class HeaderAddress extends Component {
  constructor(props) {
    super(props);
    this.inputRef = React.createRef();
    this.handleOnHeaderKeyPress = this.onHeaderKeyPress.bind(this);
    this.handleOnHeaderBlur = this.onHeaderBlur.bind(this);
  }

  render() {
    const {id, className, chipClassName, label, addresses, onAddressRemove} = this.props;
    return (
      <div className={className} onClick={() => this.fieldClick()}
        onDragOver={e => e.preventDefault()} onDrop={e => this.onDrop(e, id)}>
        <label>{label}:</label>
        {addresses.map((address, index) => (
          <div key={index} className={`${chipClassName} ${mainCss['mdc-chip']}`}
            draggable={true}
            onDragStart={event => this.onAddressDragStart(event, id, address)}>
            <div className={mainCss['mdc-chip__text']}>{address}</div>
            <i onClick={() => onAddressRemove(id, address)} className={`material-icons ${mainCss['mdc-chip__icon']}
               ${mainCss['mdc-chip__icon--trailing']}`}>cancel</i>
          </div>
        ))}
        <input id={id} ref={this.inputRef} type={'email'}
          onKeyPress={this.handleOnHeaderKeyPress} onBlur={this.handleOnHeaderBlur} />
      </div>
    );
  }

  fieldClick() {
    this.inputRef.current.focus();
  }

  onHeaderKeyPress(event) {
    const target = event.target;
    if (event.key === 'Enter' || event.key === ';') {
      if (target.validity.valid) {
        const id = target.id;
        const value = target.value.replace(/;/g, '');
        this.props.onAddressAdd(id, value);
        target.value = '';
        target.focus();
        event.preventDefault();
      } else {
        target.reportValidity();
      }
    }
  }

  onHeaderBlur(event) {
    const target = event.target;
    if (target.value.length > 0) {
      if (target.validity.valid) {
        this.props.onAddressAdd(target.id, target.value);
        target.value = '';
      } else {
        event.preventDefault();
        setTimeout(() => target.reportValidity());
      }
    }
  }

  onAddressDragStart(event, id, address) {
    event.stopPropagation();
    const payload = {id, address};
    event.dataTransfer.setData('application/json', JSON.stringify(payload));
  }

  onDrop(event, id) {
    event.preventDefault();
    const types = event.dataTransfer.types;
    if (types && Array.from(types).indexOf('application/json') >= 0) {
      const payload = JSON.parse(event.dataTransfer.getData('application/json'));
      if (id && id !== payload.id) {
        const fromId = payload.id;
        const address = payload.address;
        this.props.onAddressMove(fromId, id, address);
      }
    }
  }
}

HeaderAddress.propTypes = {
  t: PropTypes.func,
  id: PropTypes.string.isRequired,
  className: PropTypes.string,
  chipClassName: PropTypes.string,
  addresses: PropTypes.arrayOf(PropTypes.string),
  label: PropTypes.string,
  onAddressAdd: PropTypes.func,
  onAddressRemove: PropTypes.func,
  onAddressMove: PropTypes.func
};

HeaderAddress.defaultProps = {
  className: '',
  chipClassName: '',
  addresses: [],
  label: '',
  onAddressAdd: () => {},
  onAddressRemove: () => {},
  onAddressMove: () => {}
};

export default (translate()(HeaderAddress));
