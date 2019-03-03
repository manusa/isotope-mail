import React, {Component} from 'react';
import {translate} from 'react-i18next';
import PropTypes from 'prop-types';
import Autosuggest from 'react-autosuggest';
import {validateEmail} from '../../services/validation';
import mainCss from '../../styles/main.scss';

export class HeaderAddress extends Component {
  constructor(props) {
    super(props);
    this.inputRef = React.createRef();
    this.handleOnSuggestionChange = this.onSuggestionChange.bind(this);
    this.handleOnSuggestionsFetchRequested = this.onSuggestionsFetchRequested.bind(this);
    this.handleOnSuggestionsClearRequested = this.onSuggestionsClearRequested.bind(this);
    this.handleOnSuggestionSelected = this.onSuggestionSelected.bind(this);
    this.handleOnHeaderKeyDown = this.onHeaderKeyDown.bind(this);
    this.handleOnHeaderBlur = this.onHeaderBlur.bind(this);

    this.state = {
      value: '',
      suggestions: []
    };
  }

  render() {
    const {
      id,
      className, chipClassName, autoSuggestClassName, autoSuggestMenuClassName,
      label, addresses, onAddressRemove
    } = this.props;
    const {suggestions, value} = this.state;
    return (
      <div className={`${className} ${mainCss['mdc-menu-surface--anchor']}`} onClick={() => this.fieldClick()}
        onDragOver={e => e.preventDefault()} onDrop={e => this.onDrop(e, id)}>
        <label>{label}:</label>
        {addresses.map((address, index) => (
          <div key={index} className={`${chipClassName} ${mainCss['mdc-chip']}`}
            draggable={true}
            onDragStart={event => HeaderAddress.onAddressDragStart(event, id, address)}>
            <div className={mainCss['mdc-chip__text']}>{address}</div>
            <i onClick={() => onAddressRemove(id, address)} className={`material-icons ${mainCss['mdc-chip__icon']}
               ${mainCss['mdc-chip__icon--trailing']}`}>cancel</i>
          </div>
        ))}
        <Autosuggest
          suggestions={suggestions}
          ref={this.inputRef}
          inputProps={{
            id: id,
            // type: 'email', <- Chrome in combination with autosuggest has bug with backspace, must perform manual validation
            type: 'text',
            value: value,
            onChange: this.handleOnSuggestionChange,
            onKeyDown: this.handleOnHeaderKeyDown,
            onBlur: this.handleOnHeaderBlur
          }}
          getSuggestionValue={HeaderAddress.getSuggestionValue}
          renderSuggestion={HeaderAddress.renderSuggestion}
          onSuggestionsFetchRequested={this.handleOnSuggestionsFetchRequested}
          onSuggestionsClearRequested={this.handleOnSuggestionsClearRequested}
          onSuggestionSelected={this.handleOnSuggestionSelected}
          theme={{
            container: `${autoSuggestClassName} `,
            suggestionsContainer: `${mainCss['mdc-menu']} ${mainCss['mdc-menu-surface']} ${autoSuggestMenuClassName}`,
            suggestionsContainerOpen: `${mainCss['mdc-menu-surface--open']}`,
            suggestionsList: `${mainCss['mdc-list']} ${mainCss['mdc-list--dense']}`,
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

  /**
   * Clears any HTML 5 validation errors from the provided target.
   *
   * @param target
   */
  static clearValidation(target) {
    target.setCustomValidity('');
  }

  onSuggestionChange(event, {newValue}) {
    this.setState({value: newValue});
  }

  onSuggestionsFetchRequested({value}) {
    this.setState({suggestions: this.props.getAddresses(value)});
  }

  onSuggestionsClearRequested() {
    this.setState({suggestions: []});
  }

  onSuggestionSelected(event, {suggestionValue}) {
    this.setState({value: ''});
    this.props.onAddressAdd(this.props.id, suggestionValue);
    setTimeout(() => HeaderAddress.clearValidation(this.inputRef.current.input));
  }

  /**
   * Computes the value for the provided suggestion object, as suggestions are an array of strings, no computation is
   * required.
   *
   * @param suggestion object
   * @returns {string} value to render
   */
  static getSuggestionValue(suggestion) {
    return suggestion;
  }

  /**
   * Returns a component to be rendered in the suggestionList container of the Autosuggest component
   *
   * @param suggestionValue
   * @returns {*}
   */
  static renderSuggestion(suggestionValue) {
    return suggestionValue;
  }

  validateEmail(event) {
    const target = event.target;
    const error = validateEmail(target.value);
    if (error) {
      event.preventDefault();
      target.setCustomValidity(error);
      setTimeout(() => target.reportValidity());
      return false;
    }
    return true;
  }

  onHeaderKeyDown(event) {
    const target = event.target;
    HeaderAddress.clearValidation(target);
    if (event.key === 'Enter' || event.key === ';') {
      if (this.validateEmail(event)) {
        const id = target.id;
        const value = target.value.replace(/;/g, '');
        this.props.onAddressAdd(id, value);
        this.setState({value: ''});
        target.focus();
        event.preventDefault();
      }
    }
  }

  onHeaderBlur(event) {
    const target = event.target;
    if (target.value.length > 0) {
      if (this.validateEmail(event)) {
        this.props.onAddressAdd(target.id, target.value);
        this.setState({value: ''});
      }
    }
  }

  static onAddressDragStart(event, id, address) {
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
  getAddresses: PropTypes.func,
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
