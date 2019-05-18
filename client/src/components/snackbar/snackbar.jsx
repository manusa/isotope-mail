import React from 'react';
import PropTypes from 'prop-types';
import mainCss from '../../styles/main.scss';

const Snackbar = ({show, message, buttonAction, buttonLabel, alignStart}) => {
  const hasButton = buttonLabel.length > 0;
  return (
    <div
      aria-live="assertive" aria-atomic="true" aria-hidden={!show}
      className={`${mainCss['mdc-snackbar']}
      ${hasButton ? '' : mainCss['mdc-snackbar__no_action']}
      ${alignStart ? mainCss['mdc-snackbar--leading'] : ''}
      ${show ? mainCss['mdc-snackbar--open'] : ''}`}>
      <div className={mainCss['mdc-snackbar__surface']}>
        <div className={`${mainCss['mdc-snackbar__label']}`}>{message}</div>
        {hasButton &&
          <div className={mainCss['mdc-snackbar__actions']}>
            <button
              type='button'
              onClick={buttonAction}
              className={`${mainCss['mdc-button']} ${mainCss['mdc-snackbar__action']}`}
              {...(buttonLabel.length === 0 && {'aria-hidden': true})}
            >
              {buttonLabel}
            </button>
          </div>
        }
      </div>
    </div>
  );
};

Snackbar.propTypes = {
  alignStart: PropTypes.bool,
  show: PropTypes.bool.isRequired,
  message: PropTypes.string.isRequired,
  buttonLabel: PropTypes.string,
  buttonAction: PropTypes.func
};

Snackbar.defaultProps = {
  alignStart: false,
  buttonLabel: '',
  buttonAction: () => {}
};

export default Snackbar;
