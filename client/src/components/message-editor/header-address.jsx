import React, {Component} from 'react';
import {translate} from 'react-i18next';
import PropTypes from 'prop-types';
import Autosuggest from 'react-autosuggest';
import mainCss from '../../styles/main.scss';

const TEST_RECIPIENTS = [
  '"Peter" <peter@email.com>',
  '"Qatar Airways" <email@qr.qatarairways.com>'
];

export class HeaderAddress extends Component {
  constructor(props) {
    super(props);
    this.inputRef = React.createRef();
    this.handleOnHeaderKeyPress = this.onHeaderKeyPress.bind(this);
    this.handleOnHeaderBlur = this.onHeaderBlur.bind(this);

    this.state = {
      value: '',
      suggestions: []
    };
  }

  render() {
    const {id, className, chipClassName, autoSuggestClassName, autoSuggestMenuClassName, label, addresses, onAddressRemove} = this.props;
    return (
      <div className={`${className} ${mainCss['mdc-menu-surface--anchor']}`} onClick={() => this.fieldClick()}
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
        <Autosuggest
          suggestions={TEST_RECIPIENTS}
          ref={this.inputRef}
          inputProps={{
            id: id,
            type: 'email',
            value: this.state.value,
            onChange: (event, {newValue}) => this.setState({value: newValue}),
            onKeyPress: this.handleOnHeaderKeyPress,
            onBlur: this.handleOnHeaderBlur
          }}
          getSuggestionValue={suggestion => suggestion}
          renderSuggestion={suggestion => <div>{suggestion}</div>}
          onSuggestionsFetchRequested={() => {}}
          onSuggestionsClearRequested={() => {}}
          onSuggestionSelected={(event, {suggestionValue}) => {
            this.setState({value: ''});
            this.props.onAddressAdd(id, suggestionValue);
          }}
          theme={{
            container: `${autoSuggestClassName} `,
            suggestionsContainer: `${mainCss['mdc-menu']} ${mainCss['mdc-menu-surface']} ${autoSuggestMenuClassName}`,
            suggestionsContainerOpen: `${mainCss['mdc-menu-surface--open']}`,
            suggestionsList: mainCss['mdc-list'],
            suggestion: mainCss['mdc-list-item'],
            suggestionHighlighted: mainCss['mdc-list-item--activated']
          }}
        />
      </div>
    );
  }

  fieldClick() {
    this.inputRef.current.input.focus();
  }


  onHeaderKeyPress(event) {
    const target = event.target;
    if (event.key === 'Enter' || event.key === ';') {
      if (target.validity.valid) {
        const id = target.id;
        const value = target.value.replace(/;/g, '');
        this.props.onAddressAdd(id, value);
        this.setState({value: ''});
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
        this.setState({value: ''});
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
  autoSuggestClassName: PropTypes.string,
  autoSuggestMenuClassName: PropTypes.string,
  addresses: PropTypes.arrayOf(PropTypes.string),
  label: PropTypes.string,
  onAddressAdd: PropTypes.func,
  onAddressRemove: PropTypes.func,
  onAddressMove: PropTypes.func
};

HeaderAddress.defaultProps = {
  className: '',
  chipClassName: '',
  autoSuggestClassName: '',
  autoSuggestMenuClassName: '',
  addresses: [],
  label: '',
  onAddressAdd: () => {},
  onAddressRemove: () => {},
  onAddressMove: () => {}
};

export default (translate()(HeaderAddress));
