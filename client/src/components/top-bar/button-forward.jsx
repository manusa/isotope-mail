import React from 'react';
import PropTypes from 'prop-types';
import mainCss from '../../styles/main.scss';

const ButtonForward = ({outboxEmpty, forwardMessage}) => (
  outboxEmpty && (
    <button
      onClick={forwardMessage}
      className={`material-icons ${mainCss['mdc-top-app-bar__action-item']}`}>
      forward
    </button>)
);

ButtonForward.propTypes = {
  outboxEmpty: PropTypes.bool.isRequired,
  forwardMessage: PropTypes.func.isRequired
};

export default ButtonForward;
