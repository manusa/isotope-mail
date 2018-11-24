import React, {Component} from 'react';
import PropTypes from 'prop-types';
import mainCss from '../../styles/main.scss';

const Snackbar = ({show, message, buttonLabel, alignStart}) => {
  const hasButton = buttonLabel.length > 0;
  return (
    <div
      aria-live="assertive" aria-atomic="true" aria-hidden={!show}
      className={`${mainCss['mdc-snackbar']}
      ${hasButton ? '' : mainCss['mdc-snackbar__no_action']}
      ${alignStart ? mainCss['mdc-snackbar--align-start'] : ''}
      ${show ? mainCss['mdc-snackbar--active'] : ''}`}>
      <div className={`${mainCss['mdc-snackbar__text']}`}>{message}</div>
      {hasButton &&
        <div className={mainCss['mdc-snackbar__action-wrapper']}>
          <button
            type='button' className={mainCss['mdc-snackbar__action-button']} aria-hidden={buttonLabel.length === 0}>
            {buttonLabel}
          </button>
        </div>
      }
    </div>
  );
};

Snackbar.propTypes = {
  alignStart: PropTypes.bool,
  show: PropTypes.bool.isRequired,
  message: PropTypes.string.isRequired,
  buttonLabel: PropTypes.string
};

Snackbar.defaultProps = {
  alignStart: false,
  buttonLabel: ''
};

export default Snackbar;
